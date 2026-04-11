import { z } from 'zod/v4'
import { locationSchema } from '../location/schema'
import { PickupTypeEnum } from './enums'


export const clientDetailsSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z.string().min(1),
})


/**
 * @entity Reservation
 */
export const reservationSchema = z.object({
    id: z.string().optional(),

    pickupLocation: locationSchema,
    destination: locationSchema,

    pickupDate: z.date(),
    pickupTime: z.iso.time(),
    pickupType: z.enum(PickupTypeEnum),
    clientDetails: clientDetailsSchema,

    deviceId: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})


export type Reservation = z.infer<typeof reservationSchema>