import { z } from 'zod/v4'
import { locationSchema } from '../location/schema'
import { PickupTypeEnum, ReservationStatus } from './enums'
import { RESERVATION_CODE_ALPHABET_SET } from '../../../consts/reservations'


export const dateTimeSchema = z.iso.datetime().brand<'DateTime'>();


/**
 * @entity Drivers
 */
export const assignedDriverSchema = z.object({
    id: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    createdAt: dateTimeSchema.optional(),
})


export const phoneNumberSchema = z.string().superRefine((data, ctx) => {
    if (!data.startsWith('+')) {
        ctx.addIssue({
            code: 'custom',
            message: 'Phone number must start with +',
        })
    }

    if (data.length > 15) {
        ctx.addIssue({
            code: 'custom',
            message: 'Phone number must be less than 13 characters long',
        })
    }
    
    if (data.startsWith('+48') && data.length !== 12) {
        ctx.addIssue({
            code: 'custom',
            message: 'Polish phone numbers must contain 9 digits',
        })
    }
})


export const clientDataSchema = z.object({
    lastName: z.string(),
    firstName: z.string(),
    phoneNumber: phoneNumberSchema,
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

    clientData: clientDataSchema,

    pickupAt: dateTimeSchema,
    pickupType: z.enum(PickupTypeEnum),

    deleted: z.boolean().optional().nullable(),
    status: z.enum(ReservationStatus),
    assignedDriver: assignedDriverSchema.optional().nullable(),

    deviceId: z.string().optional().nullable(),
    createdBy: z.string().optional().nullable(),
    createdAt: dateTimeSchema.optional(),
    updatedAt: dateTimeSchema.optional(),
})


export type Reservation = z.infer<typeof reservationSchema>
export type DateTime = z.infer<typeof dateTimeSchema>