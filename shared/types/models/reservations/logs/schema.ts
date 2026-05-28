import { ReservationLogTypeEnum, UserTypeEnum } from "./enums";
import { z } from "zod/v4";


/**
 * If user is Unregistered id is deviceId
 */
export const userLogDataSchema = z.object({
    id: z.string(),
    type: z.enum(UserTypeEnum),
    email: z.email().optional(),
})


export const reservationLogCreatedSchema = z.object({
    type: z.literal(ReservationLogTypeEnum.CREATED),
    date: z.date(),
    reservationId: z.string(),
    user: userLogDataSchema,
})


export const reservationLogUpdatedSchema = z.object({
    type: z.literal(ReservationLogTypeEnum.UPDATED),
    date: z.date(),
    reservationId: z.string(),
    user: userLogDataSchema,
})


export const reservationLogCancelledSchema = z.object({
    type: z.literal(ReservationLogTypeEnum.CANCELLED),
    date: z.date(),
    reservationId: z.string(),
    user: userLogDataSchema,
})


export const reservationLogAssignedSchema = z.object({
    type: z.literal(ReservationLogTypeEnum.ASSIGNED),
    date: z.date(),
    reservationId: z.string(),
    assignedDriverId: z.string(),
    user: userLogDataSchema,
})


export const reservationLogCompletedSchema = z.object({
    type: z.literal(ReservationLogTypeEnum.COMPLETED),
    date: z.date(),
    reservationId: z.string(),
})


export const reservationLogSchema = z.discriminatedUnion('type', [
    reservationLogCreatedSchema,
    reservationLogUpdatedSchema,
    reservationLogCancelledSchema,
    reservationLogAssignedSchema,
    reservationLogCompletedSchema,
])

export type ReservationLog = z.infer<typeof reservationLogSchema>