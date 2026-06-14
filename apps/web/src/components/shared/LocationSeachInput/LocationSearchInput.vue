<script setup lang="ts">
import { nextTick, type Ref } from 'vue'
import { useLocationSearch } from '~/composables/geolocation/useLocationSearch'
import type { TomLocation } from '#shared/types/models/location/search/schema'
import type { PlaceCoordinates } from '#shared/types/models/location/schema'
import { formatRouteDistanceMeters } from '#shared/ui/distance/distance'
import { useWindowSize } from '@vueuse/core'


const props = withDefaults(defineProps<{
    fromModelValue?: TomLocation
    toModelValue?: TomLocation
    fromLabel?: string
    toLabel?: string
    placeholder?: string
    toPlaceholder?: string
    icon?: string
    toIcon?: string
    isInputHidden?: boolean
}>(), {
    fromModelValue: undefined,
    toModelValue: undefined,
    fromLabel: '',
    toLabel: '',
    placeholder: 'Type location',
    toPlaceholder: 'Dokąd jedziesz?',
    icon: 'i-lucide-map-pin',
    toIcon: 'i-lucide-navigation',
    isInputHidden: false,
})


const emit = defineEmits<{
    (event: 'update:fromModelValue' | 'update:toModelValue', value: TomLocation | undefined): void
    (event: 'from-location-selected' | 'to-location-selected', value: TomLocation): void
    (event: 'distance-updated', value: number): void
    (event: 'toggle-input-visibility'): void
}>()

const fromQuery = ref(props.fromModelValue?.poi?.name ?? props.fromModelValue?.address?.freeformAddress ?? '')
const toQuery = ref(props.toModelValue?.poi?.name ?? props.toModelValue?.address?.freeformAddress ?? '')

const fromSearchState = ref(fromQuery.value)
const toSearchState = ref(toQuery.value)

const fromHasFocus = ref(false)
const toHasFocus = ref(false)

const fromInputContainerRef = ref<HTMLElement | null>(null)
const toInputContainerRef = ref<HTMLElement | null>(null)

const fromChoosenLocation: Ref<PlaceCoordinates | null> = ref(props.fromModelValue?.position ?? null)
const toChoosenLocation: Ref<PlaceCoordinates | null> = ref(props.toModelValue?.position ?? null)

const fromLocationSearch = useLocationSearch(fromSearchState, toChoosenLocation)
const toLocationSearch = useLocationSearch(toSearchState, fromChoosenLocation)

const toInputActive = computed(() => fromChoosenLocation.value !== null)

const isMobileLayout = computed(() => useWindowSize().width.value < 750)


watch(
    () => props.fromModelValue,
    (location) => {
        if (location) {
            fromQuery.value = location.poi?.name || location.address.freeformAddress
        }
    },
)


watch(
    () => props.toModelValue,
    (location) => {
        if (location) {
            toQuery.value = location?.poi?.name || location?.address?.freeformAddress
        }
    },
)


watch(
    () => fromQuery.value,
    (nextQuery) => {
        fromSearchState.value = nextQuery
        if (!nextQuery.trim()) {
            fromChoosenLocation.value = null
        }
    },
    { immediate: true },
)


watch(
    () => toQuery.value,
    (nextQuery) => {
        toSearchState.value = nextQuery
    },
    { immediate: true },
)


const showFromPanel = computed(() =>
    fromHasFocus.value && fromQuery.value.trim().length > 0,
)


const showToPanel = computed(() =>
    toHasFocus.value && toQuery.value.trim().length > 0 && toInputActive.value,
)


/**
 * Primary title: POI name when present, otherwise a sensible address line for non-POI results.
 */
function displayName(item: TomLocation): string {
    const poiName = item.poi?.name?.trim()
    if (poiName) {
        return poiName
    }

    const freeform = item.address?.freeformAddress?.trim()
    if (freeform) {
        return freeform
    }

    return [item.address?.municipality]
        .filter((value): value is string => Boolean(value))
        .join(', ') || '—'
}


function handleFromQueryInput(value: string) {
    fromQuery.value = value
    if (!value.trim()) {
        emit('update:fromModelValue', undefined)
    }
}


function handleToQueryInput(value: string) {
    toQuery.value = value
    if (!value.trim()) {
        emit('update:toModelValue', undefined)
    }
}


function handleFromSelectResult(item: TomLocation) {
    fromQuery.value = item.poi?.name || item.address.freeformAddress
    fromHasFocus.value = false
    fromChoosenLocation.value = {
        lat: item.position.lat,
        lon: item.position.lon,
    }

    if (toChoosenLocation.value && !isNaN(Number(item.dist))) {
        emit('distance-updated', Number(item.dist))
    }

    emit('update:fromModelValue', item)
    emit('from-location-selected', item)
}


function handleToSelectResult(item: TomLocation) {
    toQuery.value = item.poi?.name || item.address.freeformAddress
    toHasFocus.value = false
    toChoosenLocation.value = {
        lat: item.position.lat,
        lon: item.position.lon,
    }

    if (fromChoosenLocation.value && !isNaN(Number(item.dist))) {
        emit('distance-updated', Number(item.dist))
    }

    emit('update:toModelValue', item)
    emit('to-location-selected', item)
}


function handleFromBlur() {
    window.setTimeout(() => {
        fromHasFocus.value = false
    }, 120)
}


function handleToBlur() {
    window.setTimeout(() => {
        toHasFocus.value = false
    }, 120)
}


function focusFirstInputIn(container: HTMLElement | null) {
    const input = container?.querySelector<HTMLInputElement>('input')
    input?.focus()
}


/**
 * Switches „skąd” from compact preview back to search field and focuses it.
 */
async function beginEditFrom() {
    fromHasFocus.value = true
    const loc = props.fromModelValue
    fromQuery.value = loc
        ? (loc.poi?.name ?? loc.address.freeformAddress ?? '')
        : ''
    fromSearchState.value = fromQuery.value
    await nextTick()
    focusFirstInputIn(fromInputContainerRef.value)
}


/**
 * Switches „dokąd” from compact preview back to search field and focuses it.
 */
async function beginEditTo() {
    if (!toInputActive.value) {
        return
    }

    toHasFocus.value = true
    const loc = props.toModelValue
    toQuery.value = loc
        ? (loc.poi?.name ?? loc.address.freeformAddress ?? '')
        : ''
    toSearchState.value = toQuery.value
    await nextTick()
    focusFirstInputIn(toInputContainerRef.value)
}
</script>

<template>
  <div 
    class="flex items-start gap-2 relative"
    :class="isMobileLayout ? 'flex-col' : 'flex-row'"
  >
    <UButton
      v-if="isMobileLayout && !isInputHidden"
      :icon="isInputHidden ? 'i-lucide-eye' : 'i-lucide-eye-off'"
      size="xs"
      color="neutral"
      variant="ghost"
      class="pointer-events-auto opacity-150"
      :ui="{
        base: 'absolute right-0 top-[-10px] z-10'
      }"
      @click="emit('toggle-input-visibility')"
    />

    <div 
      class="flex-1"
      :class="isMobileLayout ? 'w-full' : 'w-[calc(min(100%,600px))'"
    >
      <label
        v-if="fromLabel"
        class="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        {{ fromLabel }}
      </label>
      <div class="relative">
        <div
          v-if="fromModelValue && !fromHasFocus"
          class="flex w-full cursor-pointer gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:border-dark-700 dark:bg-dark-800 dark:hover:bg-dark-700"
          role="button"
          tabindex="0"
          @click="beginEditFrom"
          @keydown.enter.prevent="beginEditFrom"
        >
          <UIcon
            :name="fromModelValue.processedCategory.icon"
            class="mt-0.5 size-5 shrink-0 text-primary-500 dark:text-primary-400"
          />
          <div class="flex min-w-0 flex-1 gap-2">
            <div class="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
              <span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ displayName(fromModelValue) }}
              </span>
              <p class="truncate text-xs leading-tight text-gray-500 dark:text-gray-400">
                {{ fromModelValue.processedCategory.description }}
              </p>
            </div>
            <span
              v-if="fromModelValue.address?.municipality"
              class="shrink-0 self-start text-right text-xs text-gray-500 dark:text-gray-400"
            >
              {{ fromModelValue.address.municipality }}
            </span>
          </div>
        </div>

        <div
          v-show="!fromModelValue || fromHasFocus"
          ref="fromInputContainerRef"
        >
          <UInput
            :model-value="fromQuery"
            :placeholder="placeholder"
            :icon="icon"
            size="xl"
            class="w-full"
            @update:model-value="handleFromQueryInput"
            @focus="fromHasFocus = true"
            @blur="handleFromBlur"
          />
        </div>

        <div
          v-if="showFromPanel"
          class="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-800"
        >
          <div
            v-if="fromLocationSearch.queryTooShort"
            class="px-3 py-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
          >
            <p class="font-medium text-gray-800 dark:text-gray-100">
              Wpisz więcej znaków
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Potrzebujemy co najmniej <span class="font-medium text-gray-700 dark:text-gray-300">4 znaków</span>, żeby wyszukać adresy w Polsce.
            </p>
          </div>

          <div
            v-else-if="fromLocationSearch.loading"
            role="status"
            aria-live="polite"
            class="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 dark:text-gray-200"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="size-5 shrink-0 animate-spin text-primary-500 dark:text-primary-400"
            />
            <span>Szukam propozycji…</span>
          </div>

          <ul
            v-else-if="fromLocationSearch.queryResults.length > 0"
            class="max-h-60 overflow-auto py-1"
          >
            <li v-for="item in fromLocationSearch.queryResults" :key="item.id">
              <button
                type="button"
                class="flex w-full gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-dark-700"
                @mousedown.prevent="handleFromSelectResult(item)"
              >
                <UIcon
                  :name="item.processedCategory.icon"
                  class="mt-0.5 size-5 shrink-0 text-primary-500 dark:text-primary-400"
                />
                <div class="flex min-w-0 flex-1 gap-2">
                  <div class="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
                    <span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ displayName(item) }}
                    </span>
                    <p class="truncate text-xs leading-tight text-gray-500 dark:text-gray-400">
                      {{ item.processedCategory.description }}
                    </p>
                  </div>
                  <span
                    v-if="item.address?.municipality"
                    class="shrink-0 self-start text-right text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ item.address.municipality }}
                  </span>
                </div>
              </button>
            </li>
          </ul>

          <div
            v-else
            class="px-3 py-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
          >
            <p class="font-medium text-gray-800 dark:text-gray-100">
              Brak dopasowań
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Spróbuj doprecyzować: ulica, numer, kod pocztowy albo miasto — albo sprawdź pisownię.
            </p>
          </div>
        </div>
      </div>
    </div>
 
    <div v-if="fromChoosenLocation" class="flex items-center self-stretch gap-1" :class="isMobileLayout ? 'flex-row pt-2' : 'flex-col pt-5'">
      <div class="flex-1 bg-gray-200 dark:bg-dark-600" :class="isMobileLayout ? 'h-px' : 'w-px'" />
      <UIcon
        :name="isMobileLayout ? 'i-lucide-arrow-down' : 'i-lucide-arrow-right'"
        class="size-3.5 shrink-0 transition-colors duration-200"
        :class="fromChoosenLocation ? 'text-primary' : 'text-gray-300 dark:text-gray-600'"
      />
      <div class="flex-1 bg-gray-200 dark:bg-dark-600" :class="isMobileLayout ? 'h-px' : 'w-px'" />
    </div>

    <div v-show="toInputActive" class="flex-1" :class="isMobileLayout ? 'w-full' : 'min-w-0'">
      <label
        v-if="toLabel"
        class="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        {{ toLabel }}
      </label>
      <div class="relative">
        <div
          v-if="toModelValue && !toHasFocus && toInputActive"
          class="flex w-full cursor-pointer gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:border-dark-700 dark:bg-dark-800 dark:hover:bg-dark-700"
          role="button"
          tabindex="0"
          @click="beginEditTo"
          @keydown.enter.prevent="beginEditTo"
        >
          <UIcon
            :name="toModelValue.processedCategory.icon"
            class="mt-0.5 size-5 shrink-0 text-primary-500 dark:text-primary-400"
          />
          <div class="flex min-w-0 flex-1 gap-2">
            <div class="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
              <span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ displayName(toModelValue) }}
              </span>
              <p class="truncate text-xs leading-tight text-gray-500 dark:text-gray-400">
                {{ toModelValue.processedCategory.description }}
              </p>
            </div>
            <div
              v-if="toModelValue.address?.municipality || (toModelValue.dist != null && toModelValue.dist >= 0)"
              class="flex shrink-0 flex-col items-end gap-0.5 self-start text-right leading-tight"
            >
              <span
                v-if="toModelValue.address?.municipality"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                {{ toModelValue.address.municipality }}
              </span>
              <span
                v-if="toModelValue.dist != null && toModelValue.dist >= 0"
                class="text-[11px] text-gray-400 dark:text-gray-500"
              >
                {{ formatRouteDistanceMeters(toModelValue.dist) }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-show="(!toModelValue || toHasFocus) && toInputActive"
          ref="toInputContainerRef"
        >
          <UInput
            :model-value="toQuery"
            :placeholder="toPlaceholder"
            :icon="toIcon"
            :disabled="!toInputActive"
            size="lg"
            class="w-full"
            @update:model-value="handleToQueryInput"
            @focus="toHasFocus = true"
            @blur="handleToBlur"
          />
        </div>

        <div
          v-if="showToPanel"
          class="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-800"
        >
          <div
            v-if="toLocationSearch.queryTooShort"
            class="px-3 py-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
          >
            <p class="font-medium text-gray-800 dark:text-gray-100">
              Wpisz więcej znaków
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Potrzebujemy co najmniej <span class="font-medium text-gray-700 dark:text-gray-300">4 znaków</span>, żeby wyszukać adresy w Polsce.
            </p>
          </div>

          <div
            v-else-if="toLocationSearch.loading"
            role="status"
            aria-live="polite"
            class="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 dark:text-gray-200"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="size-5 shrink-0 animate-spin text-primary-500 dark:text-primary-400"
            />
            <span>Szukam propozycji…</span>
          </div>

          <ul
            v-else-if="toLocationSearch.queryResults.length > 0"
            class="max-h-60 overflow-auto py-1"
          >
            <li v-for="item in toLocationSearch.queryResults" :key="item.id">
              <button
                type="button"
                class="flex w-full gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-dark-700"
                @mousedown.prevent="handleToSelectResult(item)"
              >
                <UIcon
                  :name="item.processedCategory.icon"
                  class="mt-0.5 size-5 shrink-0 text-primary-500 dark:text-primary-400"
                />
                <div class="flex min-w-0 flex-1 gap-2">
                  <div class="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
                    <span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ displayName(item) }}
                    </span>
                    <p class="truncate text-xs leading-tight text-gray-500 dark:text-gray-400">
                      {{ item.processedCategory.description }}
                    </p>
                  </div>
                  <div
                    v-if="item.address?.municipality || (item.dist != null && item.dist >= 0)"
                    class="flex shrink-0 flex-col items-end gap-0.5 self-start text-right leading-tight"
                  >
                    <span
                      v-if="item.address?.municipality"
                      class="text-xs text-gray-500 dark:text-gray-400"
                    >
                      {{ item.address.municipality }}
                    </span>
                    <span
                      v-if="item.dist != null && item.dist >= 0"
                      class="text-[11px] text-gray-400 dark:text-gray-500"
                    >
                      {{ formatRouteDistanceMeters(item.dist) }}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          </ul>

          <div
            v-else
            class="px-3 py-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
          >
            <p class="font-medium text-gray-800 dark:text-gray-100">
              Brak dopasowań
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Spróbuj doprecyzować: ulica, numer, kod pocztowy albo miasto — albo sprawdź pisownię.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

