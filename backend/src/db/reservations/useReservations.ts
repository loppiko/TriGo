import type { Result } from '#shared/types/core'
import type { Reservation } from '#shared/types/reservations/schema'
import { getSupabaseClient } from '../supabase'
import type { User } from '@supabase/supabase-js'
import { RESERVATION_CODE_ALPHABET } from '#shared/consts/reservations'
import { ReservationStatus } from '#shared/types/reservations/enums'


export function useReservations() {
    return {
        createReservation,
    }
}


function createReservationCode(): string {
    const array = new Uint32Array(6);

    crypto.getRandomValues(array);
    
    return Array.from(array, (value) => RESERVATION_CODE_ALPHABET[value % RESERVATION_CODE_ALPHABET.length]).join('')
}


function toSupabaseReservation(reservation: Reservation, userCredentials: User | null) {
    return {
        ...reservation,
        code: (reservation.code ?? createReservationCode()),
        createdBy: (userCredentials?.id || null),
        status: reservation.status || ReservationStatus.WAITING_FOR_ASSIGNMENT,
        assignedDriver: (reservation.assignedDriver?.id || null),
        createdAt: reservation.createdAt ? reservation.createdAt : new Date().toISOString(),
        updatedAt: reservation.updatedAt ? reservation.updatedAt : new Date().toISOString(),
    }
}


async function createReservation(reservation: Omit<Reservation, 'code' | 'status'>, userCredentials: User | null): Promise<Result<{ reservationCode: string}>> {
    const reservationCode = createReservationCode()
    const supabaseReservation = toSupabaseReservation({ ...reservation, code: reservationCode, status: ReservationStatus.WAITING_FOR_ASSIGNMENT }, userCredentials)
    
    const { error } = await getSupabaseClient()
        .rpc('createReservation', {
            payload: supabaseReservation,
        })

    if (error) {
        console.error('[createReservation]', error.message, error)
        return { success: false, error: error.message }
    }

    return { success: true, data: { reservationCode: supabaseReservation.code } }
}
