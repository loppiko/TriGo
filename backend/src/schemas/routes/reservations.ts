import { z } from "zod/v4"
import { phoneNumberSchema, reservationCodeSchema, reservationSchema } from "#shared/types/models/reservations/schema"


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



export const reservationGetByCodeBodySchema = z.object({
    code: reservationCodeSchema,
    phoneNumber: phoneNumberSchema,
    deviceId: z.uuidv4()
})


export type ReservationCreationBody = z.infer<typeof reservationCreationBodySchema>
export type ReservationGetByCodeBody = z.infer<typeof reservationGetByCodeBodySchema>