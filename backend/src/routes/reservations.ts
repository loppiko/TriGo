import { useReservationsHandler } from "../handlers/reservations";
import { zValidator } from "@hono/zod-validator";
import { reservationCreationBodySchema } from "../schemas/routes/reservations";
import type { RawEnv } from "../env";
import { Hono } from "hono";
import type { HonoVariables } from "..";


// reservations/
export const reservationsRoutes = new Hono<{ Bindings: RawEnv, Variables: HonoVariables }>()
    .post('/',
        zValidator('json', reservationCreationBodySchema),
        async (c) => {
            const result = await useReservationsHandler()
                .createReservation(c.get('userCredentials'), c.req.valid('json'))

            if (result.ok) {
                return c.json(result.data)
            }

            switch (result.error) {
                case "NO_DEVICE_ID_AND_CREDENTIALS":
                    return c.json("No device id and credentials", 401)

                case "ASSIGNED_DRIVER_NO_CREDENTIALS":
                    return c.json("No credentials provided for assigned driver", 401)

                case "ASSIGNED_DRIVER_NOT_FOUND":
                    return c.json("Assigned driver not found", 404)

                case "FAILED_TO_CREATE_RESERVATION":
                    return c.json("Failed to create reservation", 500)                
            }
        }
    )
