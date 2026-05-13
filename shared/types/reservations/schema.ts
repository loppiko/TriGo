import { z } from 'zod/v4'
import { locationSchema } from '../location/schema'
import { PickupTypeEnum, ReservationStatus } from './enums'


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


/**
 * @entity Reservation
 */
export const reservationSchema = z.object({
    id: z.string().optional(),

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