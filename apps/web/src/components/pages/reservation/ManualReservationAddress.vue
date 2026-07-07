<script setup lang="ts">
import type { TomLocation } from '#shared/types/models/location/search/schema'
import type { ManualModeSelectionType } from '~/pages/index.vue';


const props = withDefaults(defineProps<{
    isPickupSelected: boolean
    isDestinationSelected: boolean
    mode: ManualModeSelectionType
    loading?: boolean
    address?: TomLocation
}>(), {
    loading: false,
    address: undefined,
})

defineEmits<{
    continue: [locationType: 'pickup' | 'destination' | null]
}>()

const streetName = computed(() => props.address?.address?.freeformAddress?.split(',')[0]?.trim() || 'Nie znaleziono adresu')
const cityData = computed(() => props.address?.address?.freeformAddress?.split(',')[1]?.trim())
const postalCode = computed(() => cityData.value?.split(' ')[0]?.trim() || 'Nieznany kod pocztowy')
const city = computed(() => cityData.value?.split(' ')[1]?.trim() || 'Nieznane miasto')


const bothOrNone = computed(() =>
    props.mode === 'manual'
    || (props.isPickupSelected && props.isDestinationSelected)
    || (!props.isPickupSelected && !props.isDestinationSelected),
)

const isPickupButtonPrimary = computed(() => bothOrNone.value || !props.isPickupSelected)
const isDestinationButtonPrimary = computed(() => bothOrNone.value || !props.isDestinationSelected)
</script>

<template>
  <div class="w-full max-w-md mx-auto rounded-2xl bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-4 shadow-lg shadow-black/10">
    <div class="flex items-center gap-3">
      <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15">
        <UIcon
          :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-map-pin'"
          class="size-5 text-primary-600 dark:text-primary-400"
          :class="loading ? 'animate-spin' : ''"
        />
      </span>

      <Transition name="address-fade" mode="out-in">
        <div
          v-if="loading"
          key="loading"
          class="flex min-w-0 flex-1 flex-col gap-2"
        >
          <USkeleton class="h-4 w-3/4 rounded" />
          <USkeleton class="h-3 w-2/5 rounded" />
        </div>
        <div
          v-else
          key="address"
          class="flex min-w-0 flex-1 flex-col gap-0.5 text-left leading-tight"
        >
          <span class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ streetName }}, {{ city }}
          </span>
          <span
            class="w-full flex justify-between truncate text-xs text-gray-500 dark:text-gray-400"
          >
            <span>{{ postalCode }}</span>
          </span>
        </div>
      </Transition>
    </div>

    <button
      v-if="address && !loading && mode === 'manual'"
      type="button"
      :disabled="loading"
      class="mt-3 w-full flex items-center gap-2 rounded-full bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 pl-5 pr-1.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-lg shadow-black/10 transition-all duration-200 enabled:hover:cursor-pointer enabled:hover:bg-gray-50 dark:enabled:hover:bg-dark-700 enabled:hover:border-primary/30 enabled:active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group"
      @click="$emit('continue', null)"
    >
      <span class="flex-1 text-center">
        {{ loading ? 'Ustalamy adres...' : 'Potwierdź lokalizację' }}
      </span>
      <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary transition-colors duration-200 group-enabled:group-hover:bg-primary/90">
        <UIcon
          v-if="loading"
          name="i-lucide-loader-circle"
          class="size-4 text-white animate-spin"
        />
        <UIcon
          v-else
          name="i-lucide-arrow-right"
          class="size-4 text-white transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </span>
    </button>
    <div
      v-if="mode === 'user-location' && address && !loading"
      class="mt-3 flex gap-2"
    >
      <button
        type="button"
        class="group flex flex-1 items-center gap-2 rounded-full border pl-1.5 pr-5 py-1.5 text-sm font-semibold shadow-lg shadow-black/10 transition-all duration-200 active:scale-95"
        :class="isPickupButtonPrimary
          ? 'bg-white dark:bg-dark-800 border-gray-100 dark:border-dark-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-700 hover:border-primary/30'
          : 'bg-gray-100 dark:bg-dark-900 border-gray-100 dark:border-dark-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-800'"
        @click="$emit('continue', 'pickup')"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
          :class="isPickupButtonPrimary
            ? 'bg-primary group-hover:bg-primary/90'
            : 'bg-gray-300 dark:bg-dark-600'"
        >
          <UIcon
            name="i-lucide-map-pin"
            class="size-4 text-white"
          />
        </span>
        <span class="flex-1 text-center truncate">Skąd</span>
      </button>

      <button
        type="button"
        class="group flex flex-1 items-center gap-2 rounded-full border pl-5 pr-1.5 py-1.5 text-sm font-semibold shadow-lg shadow-black/10 transition-all duration-200 active:scale-95"
        :class="isDestinationButtonPrimary
          ? 'bg-white dark:bg-dark-800 border-gray-100 dark:border-dark-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-700 hover:border-primary/30'
          : 'bg-gray-100 dark:bg-dark-900 border-gray-100 dark:border-dark-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-800'"
        @click="$emit('continue', 'destination')"
      >
        <span class="flex-1 text-center truncate">Dokąd</span>
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
          :class="isDestinationButtonPrimary
            ? 'bg-primary group-hover:bg-primary/90'
            : 'bg-gray-300 dark:bg-dark-600'"
        >
          <UIcon
            name="i-lucide-navigation"
            class="size-4 text-white"
          />
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.address-fade-enter-active,
.address-fade-leave-active {
  transition: opacity 0.2s ease;
}

.address-fade-enter-from,
.address-fade-leave-to {
  opacity: 0;
}
</style>
