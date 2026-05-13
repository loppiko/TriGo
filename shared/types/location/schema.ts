import { z } from 'zod/v4'

/**
 * Place coordinates schema.
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


export type PlaceCoordinates = z.infer<typeof locationCoordinatesSchema>
export type PlaceAddress = z.infer<typeof locationAddressSchema>
export type Place = z.infer<typeof locationSchema>