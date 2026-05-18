import { useReservationsHandler } from "../handlers/reservations";
import { zValidator } from "@hono/zod-validator";
import { reservationCodeParamSchema } from "../schemas/routes/reservations";
import { AppConfig, RawEnv } from "src/env";
import { Hono } from "hono";


// reservations/
export const reservationsRoutes = new Hono<{ Bindings: RawEnv, Variables: { config: AppConfig } }>()
    .get('/:code',
        zValidator('param', reservationCodeParamSchema),
        useReservationsHandler().updateReservation
    )
