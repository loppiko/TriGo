import type { ReservationCreationBody } from "../../schemas/routes/reservations";
import type { User } from "@supabase/supabase-js";
import { useDrivers } from "../../db/drivers/useDrivers";
import { useReservations } from "../../db/reservations/useReservations";
import type { ReservationCreationServiceResult } from "../../types/services/reservations/reservationsReturnTypes";


export async function createReservation(userCredentials: User | null, body: ReservationCreationBody): Promise<ReservationCreationServiceResult> {
    const processedBody = {...body}
    
    if (!userCredentials && !body.deviceId) {
        console.warn('[createReservation] No device id and credentials provided')
        return {
            ok: false,
            error: "NO_DEVICE_ID_AND_CREDENTIALS",
        }
    }

    if (!userCredentials && body.assignedDriver) {
        console.warn('[createReservation] No credentials provided for assigned driver')
        return {
            ok: false,
            error: "ASSIGNED_DRIVER_NO_CREDENTIALS",
        }
    }

    if (body.assignedDriver) {
        const driver = await useDrivers().getDriverById(body.assignedDriver.id)
        if (!driver.success) {
            console.warn('[createReservation] Failed to get driver', driver.error)
            return {
                ok: false,
                error: "ASSIGNED_DRIVER_NOT_FOUND",
            }
        }
    }

    if (userCredentials) {
        processedBody.createdBy = userCredentials.id
    }

    const result = await useReservations().createReservation(processedBody, userCredentials)
    if (!result.success) {
        console.warn('[createReservation] Failed to create reservation', result.error)
        return {
            ok: false,
            error: "FAILED_TO_CREATE_RESERVATION",
        }
    }

    return {
        ok: true,
        data: {
            reservationCode: result.data.reservationCode,
        },
    }
}