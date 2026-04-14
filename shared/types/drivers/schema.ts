import { z } from 'zod/v4'

/**
 * @entity Driver
 */
export const driverSchema = z.object({
    id: z.string().optional(),

    name: z.string().min(1),
    phoneNumber: z.string().min(1),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})

export type Driver = z.infer<typeof driverSchema>