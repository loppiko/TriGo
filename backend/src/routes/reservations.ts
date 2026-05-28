import { useReservationsHandler } from "../handlers/reservations";
import { zValidator } from "@hono/zod-validator";
import { reservationCreationBodySchema, reservationGetByCodeBodySchema } from "../schemas/routes/reservations";
import type { RawEnv } from "../env";
import { Hono } from "hono";
import type { HonoVariables } from "..";
import { apiResponse } from "../types/core";


// reservations/
export const reservationsRoutes = new Hono<{ Bindings: RawEnv, Variables: HonoVariables }>()
    .post('/',
        zValidator('json', reservationCreationBodySchema),
        async (c) => {
            const result = await useReservationsHandler()
                .createReservation(c.get('userCredentials'), c.req.valid('json'))

            if (result.success) {
                return c.json(apiResponse.success(result.data))
            }

            switch (result.error) {
                case "NO_DEVICE_ID_AND_CREDENTIALS":
                    return c.json(apiResponse.error("NO_DEVICE_ID_AND_CREDENTIALS" as const, "No device id and credentials"), 401)

                case "ASSIGNED_DRIVER_NO_CREDENTIALS":
                    return c.json(apiResponse.error("ASSIGNED_DRIVER_NO_CREDENTIALS" as const, "No credentials provided for assigned driver"), 401)

                case "ASSIGNED_DRIVER_NOT_FOUND":
                    return c.json(apiResponse.error("ASSIGNED_DRIVER_NOT_FOUND" as const, "Assigned driver not found"), 404)

                case "FAILED_TO_CREATE_RESERVATION":
                    return c.json(apiResponse.error("FAILED_TO_CREATE_RESERVATION" as const, "Failed to create reservation"), 500)
            }
        }
    )
    .get('/by-code',
        zValidator('json', reservationGetByCodeBodySchema),
        async (c) => {
            const result = await useReservationsHandler()
                .getReservationByCode(c.req.valid('json'))

            if (result.success) {
                return c.json({success: true, data: result.data})
            }

            switch (result.error) {
                case "DEVICE_ID_ACCESS_LIMIT_REACHED":
                    return c.json(apiResponse.error("DEVICE_ID_ACCESS_LIMIT_REACHED" as const, "Device ID access limit exceeded"), 403)

                case "RESERVATION_CODE_ACCESS_LIMIT_REACHED":
                    return c.json(apiResponse.error("RESERVATION_CODE_ACCESS_LIMIT_REACHED" as const, "Reservation code access limit exceeded"), 403)

                case "INVALID_CODE_OR_PHONE_NUMBER":
                    return c.json(apiResponse.error("INVALID_CODE_OR_PHONE_NUMBER" as const, "Invalid code or phone number"), 400)

                case "FAILED_TO_GET_RESERVATION":
                    return c.json(apiResponse.error("FAILED_TO_GET_RESERVATION" as const, "Failed to get reservation"), 500)
            }
        }
    )
