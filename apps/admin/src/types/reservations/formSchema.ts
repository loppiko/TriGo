import { z } from 'zod/v4'
import { assignedDriverSchema, clientDetailsSchema } from '#shared/types/reservations/schema'
import { PickupTypeEnum, ReservationStatus } from '#shared/types/reservations/enums'
import {
    locationSchema,
} from '#shared/types/location/schema'


/**
 * Mirrors `reservationSchema` from shared types, but `pickupLocation` and `destination`
 * are optional at the field level so the empty form can hold undefined values.
 * Their presence and structure are enforced in `superRefine` with Polish error messages,
 * which avoids the need for a heavy default-value factory for these nested objects.
 */
export const reservationFormSchema = z.object({
    id: z.string().optional(),

    pickupLocation: locationSchema.optional(),
    destination: locationSchema.optional(),
    distance: z.number().optional(),

    pickupDate: z.date().optional(),
    pickupTime: z.iso.time().optional(),
    pickupType: z.enum(PickupTypeEnum),
    clientDetails: clientDetailsSchema.partial(),

    deleted: z.boolean().optional(),
    status: z.enum(ReservationStatus),
    assignedDriver: assignedDriverSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.pickupLocation === undefined) {
        ctx.addIssue({
            code: "custom",
            message: 'Wybierz miejsce odbioru',
            path: ['pickupLocation'],
        })
    } else {
        const result = locationSchema.safeParse(data.pickupLocation)
        if (!result.success) {
            ctx.addIssue({
                code: "custom",
                message: "Miejsce odbioru jest nieprawidłowe",
                path: ['pickupLocation'],
            })
        }
    }

    if (data.destination === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "Wybierz cel podróży",
            path: ['destination'],
        })
    } else {
        const result = locationSchema.safeParse(data.destination)
        if (!result.success) {
            ctx.addIssue({
                code: "custom",
                message: "Cel podróży jest nieprawidłowy",
                path: ['destination'],
            })
        }
    }


    if (data.clientDetails === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "Podaj dane kontaktowe",
            path: ['clientDetails'],
        })
    } else {
        const result = clientDetailsSchema.safeParse(data.clientDetails)
        if (!result.success) {
            ctx.addIssue({
                code: "custom",
                message: "Dane kontaktowe klienta są nieprawidłowe",
                path: ['clientDetails'],
            })
        }
    }

    if (data.assignedDriver) {
        const result = assignedDriverSchema.safeParse(data.assignedDriver)
        if (!result.success) {
            ctx.addIssue({
                code: "custom",
                message: "Dane kierowcy są nieprawidłowe",
                path: ['assignedDriver'],
            })
        }
    }

    if (data.pickupDate === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "Wybierz datę odbioru",
            path: ['pickupDate'],
        })
    } else {
        const result = z.date().safeParse(data.pickupDate)
        if (!result.success) {
            ctx.addIssue({
                code: "custom",
                message: "Data odbioru jest nieprawidłowa",
                path: ['pickupDate'],
            })
        }
    }

    if (data.pickupTime === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "Wybierz godzinę odbioru",
            path: ['pickupTime'],
        })
    } else {
        const result = z.iso.time().safeParse(data.pickupTime)
        if (!result.success) {
            ctx.addIssue({
                code: "custom",
                message: "Godzinę odbioru jest nieprawidłowa",
                path: ['pickupTime'],
            })
        }
    }
})


export type ReservationForm = z.infer<typeof reservationFormSchema>
