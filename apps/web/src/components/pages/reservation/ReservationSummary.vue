<script setup lang="ts">
import type { TomLocation } from '#shared/types/location/search/schema'
import { PickupTypeEnum } from '#shared/types/reservations/enums'


const props = defineProps<{
    pickupLocation: TomLocation | undefined
    destination: TomLocation | undefined
    rideDate: string
    rideTime: string
    pickupType: PickupTypeEnum | null
    firstName: string
    lastName: string
    phoneNumber: string
    customClass?: string
}>()


defineEmits<{
    editRoute: []
    editSchedule: []
    editContact: []
    submitReservation: []
}>()


/**
 * Single-line label for summary UI (TomTom processed location).
 */
function locationDisplayLabel(location: TomLocation | undefined): string {
    if (!location) {
        return ''
    }

    return location.poi?.name?.trim()
        ?? location.address.freeformAddress?.trim()
        ?? [location.address.municipality]
            .filter((value): value is string => Boolean(value))
            .join(', ')
        ?? '—'
}


function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}


const pickupTypeLabel = computed(() => {
    if (props.pickupType === PickupTypeEnum.MEET_AND_GREET) {
        return 'Meet & Greet'
    }
    if (props.pickupType === PickupTypeEnum.STANDARD) {
        return 'Standard Pickup'
    }
    return '—'
})


const pickupTypeIcon = computed(() =>
    props.pickupType === PickupTypeEnum.MEET_AND_GREET ? 'i-lucide-handshake' : 'i-lucide-car',
)
</script>

<template>
  <div class="py-4 pb-8 mx-auto" :class="customClass ?? ''">
    <section class="text-center">
      <div class="flex flex-col items-center mb-4">
        <div class="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25 ring-4 ring-primary/10">
          4
        </div>
        <p class="mt-2.5 text-sm font-semibold text-gray-100 dark:text-gray-200">
          Podsumowanie
        </p>
      </div>

      <div class="rounded-2xl bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 shadow-sm text-left">
        <div class="space-y-4">
          <div class="flex items-start gap-3 rounded-xl bg-white dark:bg-dark-900 px-3 py-3">
            <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-map-pin" class="size-5 text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-gray-500 dark:text-gray-400">Trasa</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ locationDisplayLabel(pickupLocation) }}
              </p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <UIcon name="i-lucide-arrow-right" class="size-3 text-gray-400 shrink-0" />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ locationDisplayLabel(destination) }}
                </p>
              </div>
            </div>
            <UButton
              icon="i-lucide-pencil"
              variant="soft"
              color="primary"
              size="sm"
              aria-label="Edytuj trasę"
              class="shrink-0"
              type="button"
              @click="$emit('editRoute')"
            />
          </div>

          <div class="flex items-start gap-3 rounded-xl bg-white dark:bg-dark-900 px-3 py-3">
            <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-calendar" class="size-5 text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-gray-500 dark:text-gray-400">Termin</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                {{ formatDate(rideDate) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Godzina: {{ rideTime }}
              </p>
            </div>
            <UButton
              icon="i-lucide-pencil"
              variant="soft"
              color="primary"
              size="sm"
              aria-label="Edytuj termin"
              class="shrink-0"
              type="button"
              @click="$emit('editSchedule')"
            />
          </div>

          <div class="flex items-start gap-3 rounded-xl bg-white dark:bg-dark-900 px-3 py-3">
            <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <UIcon
                :name="pickupTypeIcon"
                class="size-5 text-primary"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-gray-500 dark:text-gray-400">Forma odbioru</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ pickupTypeLabel }}
              </p>
            </div>
            <UButton
              icon="i-lucide-pencil"
              variant="soft"
              color="primary"
              size="sm"
              aria-label="Edytuj formę odbioru"
              class="shrink-0"
              type="button"
              @click="$emit('editSchedule')"
            />
          </div>

          <div class="flex items-start gap-3 rounded-xl bg-white dark:bg-dark-900 px-3 py-3">
            <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-user" class="size-5 text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-gray-500 dark:text-gray-400">Dane kontaktowe</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ firstName }} {{ lastName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ phoneNumber }}
              </p>
            </div>
            <UButton
              icon="i-lucide-pencil"
              variant="soft"
              color="primary"
              size="sm"
              aria-label="Edytuj dane kontaktowe"
              class="shrink-0"
              type="button"
              @click="$emit('editContact')"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
