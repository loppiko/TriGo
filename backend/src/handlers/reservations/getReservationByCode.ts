import type { ResultWithErrorType } from "#shared/types/core";
import { useReservations } from "../../db/reservations/useReservations";
import type { ReservationGetByCodeBody } from "../../schemas/routes/reservations";
import type { ReservationGetByCodeServiceResult } from "../../types/services/reservations/reservationsReturnTypes";


export async function getReservationByCode(body: ReservationGetByCodeBody): Promise<ReservationGetByCodeServiceResult> {
    const accessResult = getReservationByCodeAccessCounter.isAllowedToAccessReservation(body)
    if (!accessResult.success) {
        return {
            success: false,
            error: (accessResult.errorType === "DEVICE_ID_ACCESS_LIMIT_REACHED" ? "DEVICE_ID_ACCESS_LIMIT_REACHED" : "RESERVATION_CODE_ACCESS_LIMIT_REACHED"),
        }
    }

    const reservationResult = await useReservations().getReservationByCodeAndPhoneNumber(body.code, body.phoneNumber)

    if (reservationResult.success) {
        getReservationByCodeAccessCounter.resetCounter(body)
        return {
            success: true,
            data: { reservation: reservationResult.data.reservation },
        }
    }

    if (reservationResult.errorType === "INVALID_CODE" || reservationResult.errorType === "INVALID_PHONE_NUMBER") {
        getReservationByCodeAccessCounter.incrementCounter(body)
        return {
            success: false,
            error: "INVALID_CODE_OR_PHONE_NUMBER",
        }
    }

    return {
        success: false,
        error: "FAILED_TO_GET_RESERVATION",
    }
}


const getReservationByCodeAccessCounter = useGetReservationByCodeAccessCounter()


function useGetReservationByCodeAccessCounter() {
    const deviceIdToCounter = new Map<string, { counter: number, lastAccess: Date}>()
    const reservationCodeToCounter = new Map<string, { counter: number, lastAccess: Date}>()


    function isLogAccessExpired(lastAccess: Date): boolean {
        return lastAccess.getTime() + 1000 * 60 * 60 * 24 < Date.now()
    }


    type GetReservationByCodeAccessCounterErrorType = "DEVICE_ID_ACCESS_LIMIT_REACHED" | "RESERVATION_CODE_ACCESS_LIMIT_REACHED"


    function isAllowedToAccessReservation(body: ReservationGetByCodeBody): ResultWithErrorType<void, GetReservationByCodeAccessCounterErrorType> {
        const deviceIdCounter = deviceIdToCounter.get(body.deviceId)
        const reservationCodeCounter = reservationCodeToCounter.get(body.code)

        if (deviceIdCounter && deviceIdCounter.counter > 10 && !isLogAccessExpired(deviceIdCounter.lastAccess)) {
            console.warn('[getReservationByCode] Device ID access limit exceeded', body.deviceId)
            return { success: false, errorType: 'DEVICE_ID_ACCESS_LIMIT_REACHED', errorMessage: 'Device ID access limit exceeded' }
        }

        if (reservationCodeCounter && reservationCodeCounter.counter > 20 && !isLogAccessExpired(reservationCodeCounter.lastAccess)) {
            console.warn('[getReservationByCode] Reservation code access limit exceeded', body.code)
            return { success: false, errorType: 'RESERVATION_CODE_ACCESS_LIMIT_REACHED', errorMessage: 'Reservation code access limit exceeded' }
        }

        return { success: true, data: undefined }
    }


    function incrementCounter(body: ReservationGetByCodeBody) {
        const deviceId = body.deviceId
        const reservationCode = body.code

        const deviceIdCounter = deviceIdToCounter.get(deviceId)
        const reservationCodeCounter = reservationCodeToCounter.get(reservationCode)

        if (deviceIdCounter) {
            deviceIdCounter.counter++
            deviceIdCounter.lastAccess = new Date()
        } else {
            deviceIdToCounter.set(deviceId, { counter: 1, lastAccess: new Date() })
        }

        if (reservationCodeCounter) {
            reservationCodeCounter.counter++
            reservationCodeCounter.lastAccess = new Date()
        } else {
            reservationCodeToCounter.set(reservationCode, { counter: 1, lastAccess: new Date() })
        }
    }


    function resetCounter(body: ReservationGetByCodeBody) {
        const deviceId = body.deviceId
        const reservationCode = body.code

        deviceIdToCounter.delete(deviceId)
        reservationCodeToCounter.delete(reservationCode)
    }


    return {
        isAllowedToAccessReservation,
        incrementCounter,
        resetCounter,
    }
}