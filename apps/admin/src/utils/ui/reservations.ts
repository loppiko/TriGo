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
    { label: 'Oczekuje na kierowcę', value: ReservationStatus.WAITING_FOR_ASSIGNMENT },
    { label: 'Przypisano kierowcę', value: ReservationStatus.ASSIGNED },
    { label: 'Zakończono', value: ReservationStatus.COMPLETED },
    { label: 'Anulowano', value: ReservationStatus.CANCELLED },
]