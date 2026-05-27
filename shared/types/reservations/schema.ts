import { z } from 'zod/v4'
import { locationSchema } from '../location/schema'
import { PickupTypeEnum, ReservationStatus } from './enums'
import { RESERVATION_CODE_ALPHABET_SET } from '../../consts/reservations'


/**
 * @entity Drivers
 */
export const assignedDriverSchema = z.object({
    id: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    createdAt: z.iso.datetime().optional(),
})



const clientDetailsSchema = z.object({
    lastName: z.string(),
    firstName: z.string(),
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
 * @entity Reservations
 */
export const reservationSchema = z.object({
    id: z.string().optional(),
    code: reservationCodeSchema.optional(),

    pickup: locationSchema,
    destination: locationSchema,
    distance: z.number(),

    clientDetails: clientDetailsSchema,

    pickupAt: z.iso.datetime(),
    pickupType: z.enum(PickupTypeEnum),

    deleted: z.boolean().optional(),
    status: z.enum(ReservationStatus),
    assignedDriver: assignedDriverSchema.optional(),

    deviceId: z.string().optional(),
    createdBy: z.string().optional(),
    createdAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime().optional(),
})


export type Reservation = z.infer<typeof reservationSchema>