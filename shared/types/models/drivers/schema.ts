import { z } from 'zod/v4'

/**
 * @entity Driver
 */
export const driverSchema = z.object({
    id: z.string().optional(),

    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z.string().min(1),

    createdAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime().optional(),
})

export type Driver = z.infer<typeof driverSchema>