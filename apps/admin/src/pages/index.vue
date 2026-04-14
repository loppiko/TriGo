<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { Driver } from '#shared/types/drivers/schema'
import type { Reservation } from '#shared/types/reservations/schema'
import { ReservationStatus } from '#shared/types/reservations/enums'
import AssignDriverModal from '~/components/Reservations/AssignDriverModal.vue'
import { useReservations } from '~/composables/database/useReservations'
import { ROUTES } from '~/types/consts/pages'
import { formatRouteDistanceMeters } from '~/utils/ui/distance'
import {
    pickupTypeLabel,
    reservationStatusLabel,
} from '~/utils/ui/reservations'
import { errorNotification, successfulNotification } from '~/utils/notifications/toast'


definePageMeta({
    layout: 'default',
})

const route = useRoute()

const isKanbanView = computed(() => route.query.view === 'kanban')


const navigationItems = computed<NavigationMenuItem[][]>(() => [
    [
        {
            label: 'Karty',
            icon: 'i-heroicons-squares-2x2',
            to: ROUTES.RESERVATIONS_CARDS,
            active: !isKanbanView.value,
        },
        {
            label: 'Kanban',
            icon: 'i-heroicons-view-columns',
            to: ROUTES.RESERVATIONS_KANBAN,
            active: isKanbanView.value,
        },
    ],
])


/**
 * Overrides for horizontal nav: full-width equal tabs and larger tap targets.
 */
const navigationMenuUi = {
    root: 'w-full [&>div]:w-full [&>div]:min-w-0',
    list: 'flex w-full gap-2 sm:gap-3',
    item: 'min-w-0 flex-1 basis-0',
    link: 'w-full min-h-8 justify-center gap-3 px-4 py-2 text-base font-semibold sm:min-h-[2.5rem] sm:px-6 sm:py-3 sm:text-lg',
    linkLeadingIcon: 'size-5 shrink-0 sm:size-6',
    linkLabel: 'text-base sm:text-lg',
}


const { reservations, reservationsError, reservationsPending, updateReservation } = useReservations()

const assignModalOpen = ref(false)
const assignTargetReservation = ref<Reservation | null>(null)


function openAssignModal(reservation: Reservation): void {
    assignTargetReservation.value = reservation
    assignModalOpen.value = true
}


/**
 * Persists the chosen driver on the target reservation and advances its status to ASSIGNED.
 */
async function handleAssignDriver(driver: Driver): Promise<void> {
    const id = assignTargetReservation.value?.id
    if (!id) {
        console.error('No reservation ID')
        return
    }

    if (!driver.id) {
        console.error('No driver ID')
        return
    }

    const result = await updateReservation(id, {
        assignedDriver: {
            id: driver.id,
            name: driver.name,
            phoneNumber: driver.phoneNumber,
        },
        status: ReservationStatus.ASSIGNED,
    })

    if (result.success) {
        successfulNotification('Kierowca przypisany', `${driver.name} został przypisany do rezerwacji.`)
    } else {
        errorNotification('Błąd przypisania', result.error)
    }
}


/**
 * Active reservations: excludes completed and cancelled entries for the dashboard view.
 */
const activeReservations = computed(() => {
    const list: Reservation[] = reservations.value ?? []
    return list
        .filter(
            (r) =>
                r.status !== ReservationStatus.COMPLETED
                && r.status !== ReservationStatus.CANCELLED,
        )
        .sort((a, b) => {
            const dayA = a.pickupDate.getTime()
            const dayB = b.pickupDate.getTime()
            if (dayA !== dayB) {
                return dayA - dayB
            }
            return (a.pickupTime ?? '').localeCompare(b.pickupTime ?? '')
        })
})


/**
 * Short city / place name for the route row (first non-empty of name, municipality).
 */
function formatShortLocation(location: Reservation['pickupLocation']): string {
    return location.name || location.address.municipality || location.address.freeformAddress || '—'
}


/**
 * Full address line shown on hover / secondary text.
 */
function formatFullLocation(location: Reservation['pickupLocation']): string {
    const addr = location.address
    return [addr.freeformAddress, addr.municipality].filter(Boolean).join(', ') || '—'
}


/**
 * Formats the time-only part of the pickup slot (HH:MM from ISO time string).
 */
function formatTime(reservation: Reservation): string {
    const raw = reservation.pickupTime ?? ''
    return raw.length >= 5 ? raw.slice(0, 5) : raw
}


/**
 * Formats the date part of the pickup slot as short weekday + day + month.
 */
function formatDate(reservation: Reservation): string {
    return reservation.pickupDate.toLocaleDateString('pl-PL', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-4 text-xl font-semibold text-highlighted">
      Reservations
    </h1>
    <UNavigationMenu
      orientation="horizontal"
      highlight
      highlight-color="primary"
      class="data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-b border-default mb-8"
      :items="navigationItems"
      :ui="navigationMenuUi"
    />

    <AssignDriverModal
      v-model:open="assignModalOpen"
      @confirm="handleAssignDriver"
    />

    <template v-if="!isKanbanView">
      <div>
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-highlighted">
            Aktualne rezerwacje
          </h2>
          <p class="mt-1 text-sm text-muted">
            Nadchodzące przejazdy (bez zakończonych i anulowanych), posortowane od najbliższego terminu.
          </p>
        </div>

        <UAlert
          v-if="reservationsError"
          color="error"
          variant="soft"
          title="Nie udało się wczytać rezerwacji"
          :description="String(reservationsError)"
          class="mb-6"
          icon="i-heroicons-exclamation-circle"
        />

        <div
          v-if="reservationsPending"
          class="flex items-center justify-center gap-2 py-16 text-muted"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="size-5 shrink-0 animate-spin"
          />
          <span>Ładowanie rezerwacji…</span>
        </div>

        <div
          v-else-if="activeReservations.length === 0"
          class="rounded-lg border border-dashed border-accented/40 bg-elevated/40 px-6 py-14 text-center"
        >
          <UIcon
            name="i-heroicons-calendar-days"
            class="mx-auto mb-3 size-10 text-muted"
          />
          <p class="font-medium text-highlighted">
            Brak aktywnych rezerwacji
          </p>
          <p class="mt-1 text-sm text-muted">
            Gdy pojawią się nowe rezerwacje ze statusem oczekującym lub przypisanym, zobaczysz je tutaj.
          </p>
        </div>

        <div
          v-else
          class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="res in activeReservations"
            :key="res.id ?? `${res.pickupDate?.toISOString()}-${res.clientDetails.phoneNumber}`"
            class="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md hover:ring-gray-300"
          >
            <!-- Status bar -->
            <div
              class="flex items-center justify-between px-4 py-2.5"
              :class="{
                'bg-amber-50': res.status === 'waiting-for-assignment',
                'bg-primary/5': res.status === 'assigned',
              }"
            >
              <div class="flex items-center gap-1.5">
                <span
                  class="size-2 rounded-full"
                  :class="{
                    'bg-amber-400': res.status === 'waiting-for-assignment',
                    'bg-primary': res.status === 'assigned',
                  }"
                />
                <span class="text-xs font-medium text-gray-500">
                  {{ reservationStatusLabel(res.status) }}
                </span>
              </div>
              <span class="text-xs text-gray-400">
                {{ formatDate(res) }} · {{ formatTime(res) }}
              </span>
            </div>

            <!-- Route – main content -->
            <div class="flex flex-col gap-0 px-4 pt-4 pb-3">
              <!-- From -->
              <div class="flex items-start gap-3">
                <div class="flex flex-col items-center pt-1">
                  <span class="size-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
                  <span class="mt-1 h-8 w-px bg-gray-200" />
                </div>
                <div class="min-w-0 flex-1 pb-2">
                  <div class="flex w-full items-baseline justify-between gap-2">
                    <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                      Odbiór
                    </p>
                    <span class="shrink-0 text-xs font-medium tabular-nums text-gray-500">
                      {{ formatRouteDistanceMeters(res.distance) }}
                    </span>
                  </div>
                  <p class="mt-0.5 truncate font-semibold text-gray-900">
                    {{ formatShortLocation(res.pickupLocation) }}
                  </p>
                  <p class="truncate text-xs text-gray-400">
                    {{ formatFullLocation(res.pickupLocation) }}
                  </p>
                </div>
              </div>
              <!-- To -->
              <div class="flex items-start gap-3">
                <div class="flex flex-col items-center">
                  <span class="size-2.5 rounded-sm bg-gray-700 ring-2 ring-gray-200" />
                </div>
                <div class="min-w-0">
                  <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Cel
                  </p>
                  <p class="mt-0.5 truncate font-semibold text-gray-900">
                    {{ formatShortLocation(res.destination) }}
                  </p>
                  <p class="truncate text-xs text-gray-400">
                    {{ formatFullLocation(res.destination) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="mx-4 border-t border-gray-100" />

            <!-- Client + meta -->
            <div class="flex items-center justify-between gap-3 px-4 py-3">
              <div class="flex min-w-0 items-center gap-2.5">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                  {{ res.clientDetails.firstName[0] }}{{ res.clientDetails.lastName[0] }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-900">
                    {{ res.clientDetails.firstName }} {{ res.clientDetails.lastName }}
                  </p>
                  <a
                    :href="`tel:${res.clientDetails.phoneNumber}`"
                    class="truncate text-xs text-primary hover:underline"
                  >
                    {{ res.clientDetails.phoneNumber }}
                  </a>
                </div>
              </div>

              <!-- Assigned driver pill / assign button + pickup type -->
              <div class="flex shrink-0 flex-col items-end gap-2">
                <span
                  v-if="res.assignedDriver"
                  class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  <UIcon name="i-heroicons-user" class="size-3" />
                  {{ res.assignedDriver.name.split(' ')[0] }}
                </span>
                <UButton
                  v-else
                  size="xs"
                  color="warning"
                  variant="subtle"
                  icon="i-heroicons-user-plus"
                  @click.stop="openAssignModal(res)"
                >
                  Przypisz
                </UButton>
                <UBadge
                  color="neutral"
                  variant="outline"
                  size="sm"
                >
                  {{ pickupTypeLabel(res.pickupType) }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else
      class="rounded-lg border border-dashed border-accented/45 bg-elevated/30 p-10 text-center"
    >
      <h2 class="text-lg font-semibold text-highlighted">
        Kanban
      </h2>
      <p class="mt-2 text-sm text-muted">
        Widok Kanban pojawi się w kolejnej iteracji.
      </p>
    </div>
  </div>
</template>
