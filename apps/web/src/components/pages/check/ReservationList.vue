<script setup lang="ts">
import { useReservationStore } from '~/composables/store/reservationStore'
import { useDateTime } from '~/utils/datetime/datetime'
import { formatRouteDistanceMeters } from '#shared/ui/distance/distance'
import { ROUTES } from '~/types/consts/pages'
import ReservationTypeBadge from '~/components/shared/badges/ReservationTypeBadge.vue'
import ReservationStatusBadge from '~/components/shared/badges/ReservationStatusBadge.vue'


const reservations = computed(() => useReservationStore().reservations)
const hoveredCode = ref<string | null>(null)


function handleMouseEnter(code: string | undefined): void {
    hoveredCode.value = code ?? null
}


function handleMouseLeave(): void {
    hoveredCode.value = null
}


</script>

<template>
  <div class="mx-auto py-8">
    <!-- Empty state -->
    <div
      v-if="reservations.length === 0"
      class="flex flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50/60 dark:bg-dark-700/40 px-5 py-16 text-center shadow-sm ring-1 ring-gray-200/70 dark:ring-dark-700/60"
    >
      <div class="inline-flex size-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-700">
        <UIcon name="i-lucide-inbox" class="size-6 text-gray-400 dark:text-gray-500" />
      </div>
      <p class="text-base font-semibold text-gray-900 dark:text-white">
        Brak rezerwacji
      </p>
      <p class="max-w-xs text-sm text-gray-500 dark:text-gray-400">
        Sprawdzone rezerwacje pojawią się tutaj
      </p>
    </div>

    <!-- List -->
    <div
      v-else
      class="space-y-3 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <article
        v-for="reservation in reservations"
        :key="reservation.id"
        class="group cursor-pointer mb-0 overflow-hidden rounded-2xl bg-transparent dark:bg-dark-900/30 shadow-sm ring-1 ring-gray-200/70 dark:ring-dark-700/60 transition-all duration-200 hover:shadow-md hover:ring-primary/40"
        @mouseenter="handleMouseEnter(reservation.code)"
        @mouseleave="handleMouseLeave"
        @click="navigateTo(`${ROUTES.CHECK}/${reservation.code}`)"
      >
        <!-- Top row: date/time + code -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-dark-700 px-5 py-3">
          <div class="flex items-center gap-1.5 text-sm capitalize text-gray-500 dark:text-gray-400">
            <UIcon name="i-lucide-calendar" class="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
            <span>
              {{ useDateTime().formatToLocaleDateString(reservation.pickupAt) }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
            <UIcon name="i-lucide-clock" class="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
            <span>
              {{ useDateTime().formatDateTimeToHHMM(reservation.pickupAt) }}
            </span>
          </div>
        </div>

        <!-- Body: route -->
        <div class="flex items-center gap-4 px-5 py-4 bg-gray-100/30 dark:bg-dark-800/50">
          <!-- Route -->
          <div class="min-w-0 flex-1">
            <div class="flex items-stretch gap-4">
              <div class="flex flex-col items-center gap-1 pt-1.5 pb-1.5">
                <span class="size-2 shrink-0 rounded-full bg-primary" />
                <span class="w-px flex-1 bg-gray-200 dark:bg-dark-600" />
                <span class="shrink-0 text-[10px] font-medium tabular-nums text-gray-500 dark:text-gray-400">
                  {{ formatRouteDistanceMeters(reservation.distance) }}
                </span>
                <span class="w-px flex-1 bg-gray-200 dark:bg-dark-600" />
                <span class="size-2 shrink-0 rounded-full bg-gray-700 dark:bg-gray-300" />
              </div>
              <div class="min-w-0 flex-1 space-y-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-gray-900 dark:text-white pr-8">
                    {{ reservation.pickup.name || reservation.pickup.municipality }}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ reservation.pickup.freeformAddress }}
                  </p>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-gray-900 dark:text-white pr-8">
                    {{ reservation.destination.name || reservation.destination.municipality }}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ reservation.destination.freeformAddress }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Meta: distance + chevron -->
          <div class="flex shrink-0 items-center gap-4">
            <UIcon
              name="i-heroicons-chevron-right"
              class="size-5 text-gray-300 dark:text-gray-600 transition-all duration-200"
              :class="hoveredCode === reservation.code ? 'translate-x-1 text-primary dark:text-primary' : ''"
            />
          </div>
        </div>

        <!-- Footer: status + pickup type -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-dark-700 px-5 py-3">
          <ReservationStatusBadge
            :status="reservation.status"
          />
          <ReservationTypeBadge 
            :pickup-type="reservation.pickupType"
          />
        </div>
      </article>
    </div>
  </div>
</template>
