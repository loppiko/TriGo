import type { Reservation } from '#shared/types/reservations/schema'
import { PickupTypeEnum, ReservationStatus } from '#shared/types/reservations/enums'


/**
 * Polish label for `ReservationStatus` (display on badges and screen readers).
 */
export function reservationStatusLabel(status: Reservation['status']): string {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'Oczekuje na kierowcę'
    case ReservationStatus.ASSIGNED:
        return 'Przypisano kierowcę'
    case ReservationStatus.COMPLETED:
        return 'Zakończono'
    case ReservationStatus.CANCELLED:
        return 'Anulowano'
    default:
        return status
    }
}


/**
 * Maps reservation status to Nuxt UI badge color tokens.
 */
export function reservationStatusBadgeColor(
    status: Reservation['status'],
): 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info' {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'warning'
    case ReservationStatus.ASSIGNED:
        return 'primary'
    case ReservationStatus.COMPLETED:
        return 'neutral'
    case ReservationStatus.CANCELLED:
        return 'error'
    default:
        return 'neutral'
    }
}


/**
 * Polish label for pickup type from schema enum.
 */
export function pickupTypeLabel(type: Reservation['pickupType']): string {
    switch (type) {
    case PickupTypeEnum.MEET_AND_GREET:
        return 'Meet & greet'
    case PickupTypeEnum.STANDARD:
        return 'Standard pickup'
    default:
        return type
    }
}


export const pickupTypeOptions = [
    { label: 'Standard', value: PickupTypeEnum.STANDARD },
    { label: 'Meet & Greet', value: PickupTypeEnum.MEET_AND_GREET },
]


export const statusOptions = [
    { label: 'Oczekuje na kierowcę', value: ReservationStatus.WAITING_FOR_ASSIGNMENT, icon: 'i-heroicons-clock' },
    { label: 'Przypisano kierowcę', value: ReservationStatus.ASSIGNED, icon: 'i-heroicons-user' },
    { label: 'Zakończono', value: ReservationStatus.COMPLETED, icon: 'i-heroicons-check-circle' },
    { label: 'Anulowano', value: ReservationStatus.CANCELLED, icon: 'i-heroicons-x-circle' },
]


/**
 * Full `bg-*` class for the light status-bar background on reservation cards.
 * Must return a complete, static Tailwind class so it is not purged.
 */
export function reservationStatusBgClass(status: Reservation['status']): string {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'bg-yellow-50 dark:bg-yellow-950/40'
    case ReservationStatus.ASSIGNED:
        return 'bg-green-50 dark:bg-green-950/40'
    case ReservationStatus.COMPLETED:
        return 'bg-gray-50 dark:bg-dark-950/40'
    case ReservationStatus.CANCELLED:
        return 'bg-red-50 dark:bg-red-950/40'
    default:
        return 'bg-gray-50 dark:bg-dark-700'
    }
}


/**
 * Full `hover:bg-*` class for the interactive background on status items (e.g. dropdown rows).
 * Must return a complete, static Tailwind class so it is not purged.
 */
export function reservationStatusBgHoverClass(status: Reservation['status']): string {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
    case ReservationStatus.ASSIGNED:
        return 'hover:bg-green-100 dark:hover:bg-green-900/30'
    case ReservationStatus.COMPLETED:
        return 'hover:bg-gray-100 dark:hover:bg-dark-900/30'
    case ReservationStatus.CANCELLED:
        return 'hover:bg-red-100 dark:hover:bg-red-900/30'
    default:
        return 'hover:bg-gray-100 dark:hover:bg-dark-600'
    }
}


/**
 * Full `bg-*` class for status indicator dots (filled circle).
 * Must return a complete, static Tailwind class so it is not purged.
 */
export function reservationStatusDotClass(status: Reservation['status']): string {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'bg-yellow-500'
    case ReservationStatus.ASSIGNED:
        return 'bg-green-500'
    case ReservationStatus.COMPLETED:
        return 'bg-gray-500'
    case ReservationStatus.CANCELLED:
        return 'bg-red-500'
    default:
        return 'bg-gray-400'
    }
}


/**
 * Full `text-*` class for status labels and icon colors.
 * Must return a complete, static Tailwind class so it is not purged.
 */
export function reservationStatusTextClass(status: Reservation['status']): string {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'text-yellow-700 dark:text-yellow-400'
    case ReservationStatus.ASSIGNED:
        return 'text-green-700 dark:text-green-400'
    case ReservationStatus.COMPLETED:
        return 'text-gray-700 dark:text-dark-400'
    case ReservationStatus.CANCELLED:
        return 'text-red-700 dark:text-red-400'
    default:
        return 'text-gray-600 dark:text-dark-300'
    }
}


/**
 * Full `hover:text-*!` class to lock label colour on hover in dropdown items.
 * Must return a complete, static Tailwind class so it is not purged.
 */
export function reservationStatusTextHoverClass(status: Reservation['status']): string {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'hover:text-yellow-700! dark:hover:text-yellow-400!'
    case ReservationStatus.ASSIGNED:
        return 'hover:text-green-700! dark:hover:text-green-400!'
    case ReservationStatus.COMPLETED:
        return 'hover:text-gray-700! dark:hover:text-dark-400!'
    case ReservationStatus.CANCELLED:
        return 'hover:text-red-700! dark:hover:text-red-400!'
    default:
        return 'hover:text-gray-700! dark:hover:text-dark-400!'
    }
}


/**
 * Full `text-*` class locked against the `group-data-[highlighted]` state (dropdown icons).
 * Must return a complete, static Tailwind class so it is not purged.
 */
export function reservationStatusIconClass(status: Reservation['status']): string {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'text-yellow-500 dark:text-yellow-400 group-data-[highlighted]:text-yellow-500! dark:group-data-[highlighted]:text-yellow-400!'
    case ReservationStatus.ASSIGNED:
        return 'text-green-500 dark:text-green-400 group-data-[highlighted]:text-green-500! dark:group-data-[highlighted]:text-green-400!'
    case ReservationStatus.COMPLETED:
        return 'text-gray-400 dark:text-dark-400 group-data-[highlighted]:text-gray-400! dark:group-data-[highlighted]:text-dark-400!'
    case ReservationStatus.CANCELLED:
        return 'text-red-500 dark:text-red-400 group-data-[highlighted]:text-red-500! dark:group-data-[highlighted]:text-red-400!'
    default:
        return 'text-gray-400 dark:text-dark-400 group-data-[highlighted]:text-gray-400! dark:group-data-[highlighted]:text-dark-400!'
    }
}