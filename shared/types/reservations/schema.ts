import { z } from 'zod/v4'
import { locationSchema } from '../location/schema'
import { PickupTypeEnum, ReservationStatus } from './enums'
import { RESERVATION_CODE_ALPHABET_SET } from '../../consts/reservations'


export const clientDetailsSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z.string().min(1),
})


export const assignedDriverSchema = z.object({
    id: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
})


export const reservationCodeSchema = z.string().length(6).superRefine((data, ctx) => {
    for (const char of data) {
        if (!RESERVATION_CODE_ALPHABET_SET.has(char)) {
            ctx.addIssue({
                code: 'custom',
                message: `Invalid code character: "${char}"`,
            })
        }
    }
})


/**
 * @entity Reservation
 */
export const reservationSchema = z.object({
    id: z.string().optional(),
    code: reservationCodeSchema,

    pickupLocation: locationSchema,
    destination: locationSchema,
    distance: z.number(),

    pickupDate: z.date(),
    pickupTime: z.iso.time(),
    pickupType: z.enum(PickupTypeEnum),
    clientDetails: clientDetailsSchema,

    deleted: z.boolean().optional(),
    status: z.enum(ReservationStatus),
    assignedDriver: assignedDriverSchema.optional(),

    deviceId: z.string().optional(),
    createdBy: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})


export type Reservation = z.infer<typeof reservationSchema>