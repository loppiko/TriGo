import { z } from "zod/v4"
import { reservationCodeSchema, reservationSchema } from "#shared/types/reservations/schema"


export const reservationCodeParamSchema = z.object({
    code: reservationCodeSchema
})


export const reservationCreationBodySchema = reservationSchema.omit({
    id: true,
    code: true,
    deleted: true,
    status: true,
    updatedAt: true,
    createdAt: true,
})


export type ReservationCreationBody = z.infer<typeof reservationCreationBodySchema>