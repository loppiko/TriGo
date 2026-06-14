<script setup lang="ts">
import { ROUTES } from '~/types/consts/pages'
import { formatRouteDistanceMeters } from '#shared/ui/distance/distance'
import { useReservationStore } from '~/composables/store/reservationStore'
import { useDateTime } from '~/utils/datetime/datetime'
import GoBackButton from '~/components/shared/buttons/GoBackButton.vue'
import ReservationCodeBadge from '~/components/shared/ReservationCode/ReservationCodeBadge.vue'
import ReservationTypeBadge from '~/components/shared/badges/ReservationTypeBadge.vue'
import ReservationStatusBadge from '~/components/shared/badges/ReservationStatusBadge.vue'


definePageMeta({
    layout: 'reservation',
})

const code = useRoute().params.code as string
const reservation = computed(() => useReservationStore().getReservationByCode(code))
</script>

<template>
  <div class="mx-auto max-w-3xl py-16">
    <!-- Back nav -->
    <div class="mb-6 flex items-center justify-between gap-3">
      <GoBackButton :text="'Rezerwacje'" @on-click="navigateTo(ROUTES.CHECK)" />
    </div>

    <!-- Error -->
    <UAlert
      v-if="!reservation"
      color="error"
      variant="soft"
      title="Nie udało się wczytać rezerwacji"
      description="Sprawdź, czy link jest poprawny."
      icon="i-heroicons-exclamation-circle"
      class="mb-6"
    />

    <!-- Content -->
    <div
      v-if="reservation"
      class="space-y-5"
    >
      <!-- Header card -->
      <div class="overflow-hidden rounded-2xl bg-white/60 dark:bg-dark-800/50 border-gray-100 dark:border-dark-700 shadow-sm ring-1 ring-gray-200 dark:ring-dark-700">
        <!-- Status bar -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
          :class="{
            'bg-amber-50 dark:bg-amber-500/10': reservation.status === 'waiting-for-assignment',
            'bg-primary/5 dark:bg-primary/10': reservation.status === 'assigned',
          }"
        >
          <ReservationStatusBadge
            :status="reservation.status"
            size="md"
          />
          <ReservationTypeBadge
            :pickup-type="reservation.pickupType"
            size="md"
          />
        </div>

        <!-- Date / time / code row -->
        <div class="grid grid-cols-3 divide-x divide-gray-100 dark:divide-dark-700 border-t border-gray-100 dark:border-dark-700">
          <div class="px-5 py-4">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Data
            </p>
            <p class="mt-1 text-sm font-semibold capitalize text-gray-900 dark:text-white">
              {{ useDateTime().formatToLocaleDateString(reservation.pickupAt) }}
            </p>
          </div>
          <div class="px-5 py-4">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Godzina odbioru
            </p>
            <p class="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
              {{ useDateTime().formatDateTimeToHHMM(reservation.pickupAt) }}
            </p>
          </div>
          <div class="px-5 py-4">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Kod rezerwacji
            </p>
            <ReservationCodeBadge :code="reservation.code ?? ''" size="lg" />
          </div>
        </div>
      </div>

      <!-- Route card -->
      <div class="overflow-hidden rounded-2xl bg-white dark:bg-dark-800/50 shadow-sm ring-1 ring-gray-200 dark:ring-dark-700">
        <div class="border-b border-gray-100 dark:border-dark-700 px-5 py-3">
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Trasa przejazdu
          </p>
        </div>
        <div class="px-5 py-4">
          <div class="flex items-stretch gap-4">
            <!-- Markers + distance -->
            <div class="flex flex-col items-center gap-1.5 pt-1.5 pb-1.5">
              <span class="size-3 shrink-0 rounded-full bg-primary" />
              <span class="w-[1.5px] flex-1 bg-gray-200 dark:bg-dark-600" />
              <span class="shrink-0 text-[12px] font-medium tabular-nums text-gray-500 dark:text-gray-400">
                {{ formatRouteDistanceMeters(reservation.distance) }}
              </span>
              <span class="w-[1.5px] flex-1 bg-gray-200 dark:bg-dark-600" />
              <span class="size-3 shrink-0 rounded-full bg-gray-700 dark:bg-gray-300" />
            </div>
            <!-- Pickup + destination -->
            <div class="min-w-0 flex-1 space-y-4">
              <div class="min-w-0">
                <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Miejsce odbioru
                </p>
                <p class="mt-0.5 text-base font-semibold text-gray-900 dark:text-white">
                  {{ reservation.pickup.name || reservation.pickup.municipality }}
                </p>
                <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {{ reservation.pickup.freeformAddress }}
                </p>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Cel podróży
                </p>
                <p class="mt-0.5 text-base font-semibold text-gray-900 dark:text-white">
                  {{ reservation.destination.name || reservation.destination.municipality }}
                </p>
                <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {{ reservation.destination.freeformAddress }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Client & Driver row -->
      <div class="grid gap-5 sm:grid-cols-2">
        <!-- Client card -->
        <div class="overflow-hidden rounded-2xl bg-white/60 dark:bg-dark-800/50 border-gray-100 dark:border-dark-700 shadow-sm ring-1 ring-gray-200 dark:ring-dark-700">
          <div class="border-b border-gray-100 dark:border-dark-700 px-5 py-3">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Klient
            </p>
          </div>
          <div class="flex items-center gap-4 px-5 py-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-700 text-base font-bold text-gray-600 dark:text-gray-300">
              {{ reservation.clientData.firstName[0] }}{{ reservation.clientData.lastName[0] }}
            </div>
            <div class="min-w-0">
              <p class="text-base font-semibold text-gray-900 dark:text-white">
                {{ reservation.clientData.firstName }} {{ reservation.clientData.lastName }}
              </p>
              <a
                :href="`tel:${reservation.clientData.phoneNumber}`"
                class="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <UIcon name="i-heroicons-phone" class="size-3.5" />
                {{ reservation.clientData.phoneNumber }}
              </a>
            </div>
          </div>
        </div>

        <!-- Driver card -->
        <div class="overflow-hidden rounded-2xl bg-white/60 dark:bg-dark-800/50 border-gray-100 dark:border-dark-700 shadow-sm ring-1 ring-gray-200 dark:ring-dark-700">
          <div class="border-b border-gray-100 dark:border-dark-700 px-5 py-3">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Kierowca
            </p>
          </div>
          <div
            v-if="reservation.assignedDriver"
            class="flex items-center gap-4 px-5 py-4"
          >
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
              {{ reservation.assignedDriver.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('') }}
            </div>
            <div class="min-w-0">
              <p class="text-base font-semibold text-gray-900 dark:text-white">
                {{ reservation.assignedDriver.name }}
              </p>
              <a
                :href="`tel:${reservation.assignedDriver.phoneNumber}`"
                class="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <UIcon name="i-heroicons-phone" class="size-3.5" />
                {{ reservation.assignedDriver.phoneNumber }}
              </a>
            </div>
          </div>
          <div
            v-else
            class="flex flex-col items-start gap-3 px-5 py-4"
          >
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Brak przypisanego kierowcy
            </p>
          </div>
        </div>
      </div>

      <!-- Meta info -->
      <div class="overflow-hidden rounded-2xl bg-white dark:bg-dark-800/50 shadow-sm ring-1 ring-gray-200 dark:ring-dark-700">
        <div class="border-b border-gray-100 dark:border-dark-700 px-5 py-3">
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Informacje techniczne
          </p>
        </div>
        <div class="grid divide-y divide-gray-50 dark:divide-dark-700 px-5 text-sm">
          <div
            v-if="reservation.createdAt"
            class="flex items-baseline justify-between gap-4 py-3"
          >
            <span class="text-gray-400 dark:text-gray-500">Utworzono</span>
            <span class="text-gray-700 dark:text-gray-300">{{ new Date(reservation.createdAt).toLocaleString('pl-PL') }}</span>
          </div>
          <div
            v-if="reservation.updatedAt"
            class="flex items-baseline justify-between gap-4 py-3"
          >
            <span class="text-gray-400 dark:text-gray-500">Ostatnia zmiana</span>
            <span class="text-gray-700 dark:text-gray-300">{{ new Date(reservation.updatedAt).toLocaleString('pl-PL') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>