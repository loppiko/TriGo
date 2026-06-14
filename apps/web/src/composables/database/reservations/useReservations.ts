import type { Result, ResultWithErrorType } from '#shared/types/core'
import type { Reservation } from '#shared/types/models/reservations/schema'
import { useSessionStorage } from '~/composables/auth/useSession'
import { getHonoClient } from '~/composables/backend/hono'
import { useReservationStore } from '~/composables/store/reservationStore'


export function useReservations() {
    return {
        createReservation,
        getReservationByCodeAndPhoneNumber,
    }
}


async function createReservation(reservation: Omit<Reservation, 'id' | 'code' | 'deleted' | 'status' | 'updatedAt' | 'createdAt'>): Promise<Result<{reservation: Reservation}>> {
    try {
        const deviceId = useSessionStorage().deviceId.value

        const response = await getHonoClient().reservations.$post({ json: { ...reservation, deviceId } })

        const rawData = await response.json()

        if (!rawData.success) {
            console.error('[createReservation] Backend error:', rawData.error.type, rawData.error.message)
            return { success: false, error: `Request failed: ${rawData.error.message}` }
        } else {
            useReservationStore().addReservation(rawData.data.reservation)
            return { success: true, data: { reservation: rawData.data.reservation } }
        }

    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error('[createReservation] Invalid JSON response:', error)
            return { success: false, error: 'Invalid JSON response' }
        }

        console.error('[createReservation] Network error:', error)
        return { success: false, error: 'Network error' }
    }
}
    

type GetReservationByCodeAndPhoneNumberErrorType = 'DEVICE_ID_ACCESS_LIMIT_REACHED' | 'RESERVATION_CODE_ACCESS_LIMIT_REACHED' | 'INVALID_CODE_OR_PHONE_NUMBER' | 'FAILED_TO_GET_RESERVATION' | 'UNKNOWN_ERROR'


async function getReservationByCodeAndPhoneNumber(code: string, phoneNumber: string): Promise<ResultWithErrorType<{ reservation: Reservation }, GetReservationByCodeAndPhoneNumberErrorType>> {

    try {
        const deviceId = useSessionStorage().deviceId.value
        const response = await getHonoClient().reservations['by-code'].$post({ json: { code, phoneNumber, deviceId } })

        const rawData = await response.json()
            
        if (rawData.success === false) {
            switch (rawData.error.type) {
            case 'DEVICE_ID_ACCESS_LIMIT_REACHED':
                return { success: false, errorType: 'DEVICE_ID_ACCESS_LIMIT_REACHED', errorMessage: rawData.error.message }

            case 'RESERVATION_CODE_ACCESS_LIMIT_REACHED':
                return { success: false, errorType: 'RESERVATION_CODE_ACCESS_LIMIT_REACHED', errorMessage: rawData.error.message }

            case 'INVALID_CODE_OR_PHONE_NUMBER':
                return { success: false, errorType: 'INVALID_CODE_OR_PHONE_NUMBER', errorMessage: rawData.error.message }
                        
            case 'FAILED_TO_GET_RESERVATION':
                return { success: false, errorType: 'FAILED_TO_GET_RESERVATION', errorMessage: rawData.error.message }
            }
                
            return { success: false, errorType: 'UNKNOWN_ERROR', errorMessage: rawData.error.message }
        }

        return { success: true, data: { reservation: rawData.data.reservation } }
    } catch (error) {

        if (error instanceof SyntaxError) {
            console.error('[getReservationByCodeAndPhoneNumber] Invalid JSON response:', error)
            return { success: false, errorType: 'FAILED_TO_GET_RESERVATION', errorMessage: 'Invalid JSON response' }
        }

        console.error('[getReservationByCodeAndPhoneNumber] Network error:', error)
        return { success: false, errorType: 'FAILED_TO_GET_RESERVATION', errorMessage: 'Network error' }
    }
}