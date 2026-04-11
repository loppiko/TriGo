import { z } from 'zod/v4'

/**
 * Location coordinates schema.
 */
export const locationCoordinatesSchema = z.object({
    lat: z.number(),
    lon: z.number(),
})


export const locationAddressSchema = z.object({
    freeformAddress: z.string(),
    municipality: z.string(),
    countryCode: z.string(),
})


export const locationSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    address: locationAddressSchema,
    position: locationCoordinatesSchema,
})


export type LocationCoordinates = z.infer<typeof locationCoordinatesSchema>
export type LocationAddress = z.infer<typeof locationAddressSchema>
export type Location = z.infer<typeof locationSchema>