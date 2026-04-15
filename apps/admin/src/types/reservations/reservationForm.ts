import type { Result } from '#shared/types/core'
import { PickupTypeEnum, ReservationStatus } from '#shared/types/reservations/enums'
import type { Reservation } from '#shared/types/reservations/schema'
import { reservationSchema } from '#shared/types/reservations/schema'
import { reservationFormSchema } from './formSchema'
import type { ReservationForm } from './formSchema'


/**
 * Validates the form data in two passes:
 * 1. `reservationFormSchema` — surfaces user-friendly Polish messages (including
 *    location presence/structure checks from `superRefine`).
 * 2. `reservationSchema`  — guarantees the full shared `Reservation` contract
 *    and produces the correctly typed output.
 */
export function reservationFormToReservation(reservationForm: ReservationForm): Result<Reservation> {
    const formResult = reservationFormSchema.safeParse(reservationForm)

    if (!formResult.success) {
        const issues = formResult.error.issues
        const errorMessage = issues.length === 1
            ? (issues[0]?.message ?? 'Walidacja formularza nie powiodła się')
            : issues.map((issue) => issue.message).join('; ')

        console.error('[reservationFormToReservation] Form validation failed:', issues)
        return { success: false, error: errorMessage }
    }

    const parsed = reservationSchema.safeParse(reservationForm)

    if (!parsed.success) {
        const issues = parsed.error.issues
        const errorMessage = issues.length === 1
            ? (issues[0]?.message ?? 'Walidacja rezerwacji nie powiodła się')
            : issues.map((issue) => issue.message).join('; ')

        console.error('[reservationFormToReservation] Reservation validation failed:', issues)
        return { success: false, error: errorMessage }
    }

    return { success: true, data: parsed.data }
}


export function reservationToReservationForm(reservation: Reservation): ReservationForm {
    const form: ReservationForm = {
        ...reservation,
        clientDetails: {
            ...reservation.clientDetails,
        },
        pickupLocation: {
            ...reservation.pickupLocation,
        },
        destination: {
            ...reservation.destination,
        },
        pickupDateStr: reservation.pickupDate.toISOString().split('T')[0] ?? '',
        pickupTimeStr: reservation.pickupTime.slice(0, 5),
    }

    if (form.assignedDriver) {
        form.assignedDriver = {
            id: form.assignedDriver.id,
            name: form.assignedDriver.name,
            phoneNumber: form.assignedDriver.phoneNumber,
        }
    }

    return form
}


export function createEmptyReservationForm(): ReservationForm {
    return {
        distance: 0,
        pickupDateStr: '',
        pickupTimeStr: '',
        pickupType: PickupTypeEnum.STANDARD,
        clientDetails: {
            firstName: '',
            lastName: '',
            phoneNumber: '',
        },
        status: ReservationStatus.WAITING_FOR_ASSIGNMENT,
    }
}