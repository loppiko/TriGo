<script setup lang="ts">
import type { Driver } from '#shared/types/drivers/schema'
import ModalBase from '~/components/Modal/Base.vue'
import { useDrivers } from '~/composables/database/useDrivers'


const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
    confirm: [driver: Driver]
}>()

const { drivers, driversPending } = useDrivers()

const selectedDriverId = ref<string | null>(null)

const selectedDriver = computed(
    () => drivers.value?.find((d) => d.id === selectedDriverId.value) ?? null,
)

const pending = ref(false)


watch(open, (isOpen) => {
    if (!isOpen) {
        selectedDriverId.value = null
        pending.value = false
    }
})


function handleConfirm(close: () => void): void {
    if (!selectedDriver.value) {
        return
    }
    pending.value = true
    emit('confirm', selectedDriver.value)
    pending.value = false
    close()
    open.value = false
}
</script>

<template>
  <ModalBase
    v-model:open="open"
    title="Przypisz kierowcę"
    description="Wybierz kierowcę do obsługi tej rezerwacji."
    class="max-w-md"
    :dismissible="!pending"
  >
    <div class="space-y-2">
      <div
        v-if="driversPending"
        class="flex items-center justify-center gap-2 py-8 text-muted"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="size-4 animate-spin"
        />
        <span class="text-sm">Ładowanie kierowców…</span>
      </div>

      <div
        v-else-if="!drivers?.length"
        class="rounded-md border border-dashed border-accented/40 px-4 py-8 text-center text-sm text-muted"
      >
        Brak kierowców w bazie. Dodaj pierwszego kierowcę przed przypisaniem.
      </div>

      <button
        v-for="driver in drivers"
        :key="driver.id"
        type="button"
        class="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="
          selectedDriverId === driver.id
            ? 'border-primary bg-primary/5 ring-1 ring-primary/25'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-dark-600 dark:hover:border-dark-500 dark:hover:bg-dark-700'
        "
        @click="selectedDriverId = driver.id ?? null"
      >
        <div
          class="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          :class="
            selectedDriverId === driver.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-dark-600 dark:text-gray-300'
          "
        >
          {{ driver.name.split(' ').map((p) => p[0]).slice(0, 2).join('') }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ driver.name }}
          </p>
          <p class="truncate text-xs text-muted">
            {{ driver.phoneNumber }}
          </p>
        </div>
        <UIcon
          v-if="selectedDriverId === driver.id"
          name="i-heroicons-check-circle"
          class="size-5 shrink-0 text-primary"
        />
      </button>
    </div>

    <template #footer="{ close }">
      <UButton
        variant="ghost"
        color="neutral"
        :disabled="pending"
        @click="close"
      >
        Anuluj
      </UButton>
      <UButton
        color="primary"
        :loading="pending"
        :disabled="!selectedDriver || pending"
        @click="handleConfirm(close)"
      >
        Przypisz
      </UButton>
    </template>
  </ModalBase>
</template>
