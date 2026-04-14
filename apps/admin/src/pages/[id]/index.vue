<script setup lang="ts">
import type { Driver } from '#shared/types/drivers/schema'
import { ReservationStatus } from '#shared/types/reservations/enums'
import AssignDriverModal from '~/components/Reservations/AssignDriverModal.vue'
import { useReservations } from '~/composables/database/useReservations'
import { ROUTES } from '~/types/consts/pages'
import { formatRouteDistanceMeters } from '~/utils/ui/distance'
import { errorNotification, successfulNotification } from '~/utils/notifications/toast'
import {
    pickupTypeLabel,
    reservationStatusBadgeColor,
    reservationStatusLabel,
} from '~/utils/ui/reservations'


definePageMeta({
    layout: 'default',
})

const route = useRoute()
const id = computed(() => String(route.params.id))

const { useReservationById, updateReservation } = useReservations()
const { data: reservation, pending, error } = useReservationById(id.value)

const assignModalOpen = ref(false)


/**
 * Formats a full date with weekday for the detail header.
 */
function formatFullDate(date: Date): string {
    return date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}


/**
 * Formats HH:MM from an ISO time string.
 */
function formatTime(time: string): string {
    return time.length >= 5 ? time.slice(0, 5) : time
}


/**
 * Returns the full address as a single string for a location.
 */
function formatAddress(location: { name?: string, address: { freeformAddress: string, municipality: string, countryCode: string } }): string {
    return [location.name, location.address.freeformAddress, location.address.municipality]
        .filter(Boolean)
        .join(', ')
}


/**
 * Assigns the chosen driver and advances the reservation status to ASSIGNED.
 */
async function handleAssignDriver(driver: Driver): Promise<void> {
    if (!id.value) {
        return
    }

    const result = await updateReservation(id.value, {
        assignedDriver: {
            id: driver.id ?? '',
            name: driver.name,
            phoneNumber: driver.phoneNumber,
        },
        status: ReservationStatus.ASSIGNED,
    })

    if (result.success) {
        successfulNotification('Kierowca przypisany', `${driver.name} został przypisany do rezerwacji.`)
    } else {
        console.error('Failed to assign driver', result.error)
        errorNotification('Błąd przypisania', result.error)
    }
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <!-- Back nav -->
    <div class="mb-6 flex items-center gap-3">
      <UButton
        :to="ROUTES.HOME"
        variant="ghost"
        color="neutral"
        icon="i-heroicons-arrow-left"
        size="lg"
      >
        Rezerwacje
      </UButton>
    </div>

    <!-- Error -->
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Nie udało się wczytać rezerwacji"
      :description="String(error)"
      icon="i-heroicons-exclamation-circle"
      class="mb-6"
    />

    <!-- Loading -->
    <div
      v-if="pending"
      class="flex items-center justify-center gap-2 py-24 text-muted"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="size-5 animate-spin"
      />
      <span>Ładowanie…</span>
    </div>

    <!-- Not found -->
    <div
      v-else-if="!reservation"
      class="rounded-lg border border-dashed border-accented/40 bg-elevated/40 px-6 py-14 text-center"
    >
      <UIcon
        name="i-heroicons-exclamation-circle"
        class="mx-auto mb-3 size-10 text-muted"
      />
      <p class="font-medium text-highlighted">
        Rezerwacja nie istnieje
      </p>
      <p class="mt-1 text-sm text-muted">
        Sprawdź, czy link jest poprawny.
      </p>
    </div>

    <!-- Content -->
    <div
      v-else
      class="space-y-5"
    >
      <!-- Header card -->
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <!-- Status bar -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
          :class="{
            'bg-amber-50': reservation.status === 'waiting-for-assignment',
            'bg-primary/5': reservation.status === 'assigned',
          }"
        >
          <UBadge
            :color="reservationStatusBadgeColor(reservation.status)"
            variant="subtle"
            size="md"
          >
            {{ reservationStatusLabel(reservation.status) }}
          </UBadge>
          <UBadge
            color="neutral"
            variant="outline"
            size="sm"
          >
            {{ pickupTypeLabel(reservation.pickupType) }}
          </UBadge>
        </div>

        <!-- Date / time / distance row -->
        <div class="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
          <div class="px-5 py-4">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Data
            </p>
            <p class="mt-1 text-sm font-semibold capitalize text-gray-900">
              {{ formatFullDate(reservation.pickupDate) }}
            </p>
          </div>
          <div class="px-5 py-4">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Godzina odbioru
            </p>
            <p class="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {{ formatTime(reservation.pickupTime) }}
            </p>
          </div>
          <div class="px-5 py-4">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Dystans
            </p>
            <p class="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {{ formatRouteDistanceMeters(reservation.distance) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Route card -->
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div class="border-b border-gray-100 px-5 py-3">
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Trasa przejazdu
          </p>
        </div>
        <div class="px-5 py-4">
          <!-- Pickup -->
          <div class="flex items-start gap-4">
            <div class="flex flex-col items-center pt-1">
              <span class="size-3 rounded-full bg-primary ring-2 ring-primary/20" />
              <span class="mt-1.5 h-10 w-px bg-gray-200" />
            </div>
            <div class="min-w-0 flex-1 pb-4">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Miejsce odbioru
              </p>
              <p class="mt-0.5 text-base font-semibold text-gray-900">
                {{ reservation.pickupLocation.name || reservation.pickupLocation.address.municipality }}
              </p>
              <p class="mt-0.5 text-sm text-gray-500">
                {{ formatAddress(reservation.pickupLocation) }}
              </p>
              <p
                v-if="reservation.pickupLocation.description"
                class="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs italic text-gray-500"
              >
                {{ reservation.pickupLocation.description }}
              </p>
            </div>
          </div>
          <!-- Destination -->
          <div class="flex items-start gap-4">
            <div class="flex flex-col items-center pt-1">
              <span class="size-3 rounded-sm bg-gray-700 ring-2 ring-gray-200" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Cel podróży
              </p>
              <p class="mt-0.5 text-base font-semibold text-gray-900">
                {{ reservation.destination.name || reservation.destination.address.municipality }}
              </p>
              <p class="mt-0.5 text-sm text-gray-500">
                {{ formatAddress(reservation.destination) }}
              </p>
              <p
                v-if="reservation.destination.description"
                class="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs italic text-gray-500"
              >
                {{ reservation.destination.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Client & Driver row -->
      <div class="grid gap-5 sm:grid-cols-2">
        <!-- Client card -->
        <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div class="border-b border-gray-100 px-5 py-3">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Klient
            </p>
          </div>
          <div class="flex items-center gap-4 px-5 py-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-bold text-gray-600">
              {{ reservation.clientDetails.firstName[0] }}{{ reservation.clientDetails.lastName[0] }}
            </div>
            <div class="min-w-0">
              <p class="text-base font-semibold text-gray-900">
                {{ reservation.clientDetails.firstName }} {{ reservation.clientDetails.lastName }}
              </p>
              <a
                :href="`tel:${reservation.clientDetails.phoneNumber}`"
                class="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <UIcon name="i-heroicons-phone" class="size-3.5" />
                {{ reservation.clientDetails.phoneNumber }}
              </a>
            </div>
          </div>
        </div>

        <!-- Driver card -->
        <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div class="border-b border-gray-100 px-5 py-3">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">
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
              <p class="text-base font-semibold text-gray-900">
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
            <p class="text-sm text-gray-400">
              Brak przypisanego kierowcy
            </p>
            <UButton
              size="sm"
              color="warning"
              variant="soft"
              icon="i-heroicons-user-plus"
              @click="assignModalOpen = true"
            >
              Przypisz kierowcę
            </UButton>
          </div>
        </div>
      </div>

      <!-- Meta info -->
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div class="border-b border-gray-100 px-5 py-3">
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Informacje techniczne
          </p>
        </div>
        <div class="grid divide-y divide-gray-50 px-5 text-sm">
          <div class="flex items-baseline justify-between gap-4 py-3">
            <span class="text-gray-400">ID rezerwacji</span>
            <span class="font-mono text-xs text-gray-600">{{ reservation.id }}</span>
          </div>
          <div
            v-if="reservation.deviceId"
            class="flex items-baseline justify-between gap-4 py-3"
          >
            <span class="text-gray-400">ID urządzenia</span>
            <span class="font-mono text-xs text-gray-600">{{ reservation.deviceId }}</span>
          </div>
          <div
            v-if="reservation.createdAt"
            class="flex items-baseline justify-between gap-4 py-3"
          >
            <span class="text-gray-400">Utworzono</span>
            <span class="text-gray-700">{{ reservation.createdAt.toLocaleString('pl-PL') }}</span>
          </div>
          <div
            v-if="reservation.updatedAt"
            class="flex items-baseline justify-between gap-4 py-3"
          >
            <span class="text-gray-400">Ostatnia zmiana</span>
            <span class="text-gray-700">{{ reservation.updatedAt.toLocaleString('pl-PL') }}</span>
          </div>
        </div>
      </div>
    </div>

    <AssignDriverModal
      v-model:open="assignModalOpen"
      @confirm="handleAssignDriver"
    />
  </div>
</template>
