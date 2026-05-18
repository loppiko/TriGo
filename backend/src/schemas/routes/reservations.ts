import { z } from "zod/v4"
import { reservationCodeSchema } from "#shared/types/reservations/schema"


export const reservationCodeParamSchema = z.object({
    code: reservationCodeSchema
})