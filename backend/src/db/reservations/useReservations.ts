import type { Result, ResultWithErrorType } from '#shared/types/core'
import type { Reservation } from '#shared/types/models/reservations/schema'
import { getSupabaseClient } from '../supabase'
import type { User } from '@supabase/supabase-js'
import { RESERVATION_CODE_ALPHABET } from '#shared/consts/reservations'
import { ReservationStatus } from '#shared/types/models/reservations/enums'


export function useReservations() {
    return {
        createReservation,
        getReservationByCodeAndPhoneNumber,
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


type GetReservationByCodeAndPhoneNumberDbErrorType = 'INVALID_CODE'
    | 'INVALID_PHONE_NUMBER'
    | 'UNKNOWN_ERROR'


async function getReservationByCodeAndPhoneNumber(code: string, phoneNumber: string): Promise<ResultWithErrorType<{reservation: Reservation}, GetReservationByCodeAndPhoneNumberDbErrorType>> {
    const { data, error } = await getSupabaseClient()
        .rpc('getReservationByCodeAndPhoneNumber', {
            reservationcode: code,
            phonenumber: phoneNumber,
        })

    if (error?.message === 'INVALID_CODE') {
        return { success: false, errorType: 'INVALID_CODE', errorMessage: error.message }
    }

    if (error?.message === 'INVALID_PHONE_NUMBER') {
        return { success: false, errorType: 'INVALID_PHONE_NUMBER', errorMessage: error.message }
    }

    if (error) {
        return { success: false, errorType: 'UNKNOWN_ERROR', errorMessage: error.message }
    }

    return { success: true, data: { reservation: data as Reservation } }
}