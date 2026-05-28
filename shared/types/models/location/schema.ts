import { z } from 'zod/v4'

/**
 * Place coordinates schema.
 */
export const locationCoordinatesSchema = z.object({
    lat: z.number(),
    lon: z.number(),
})


export const locationSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    lat: z.number(),
    lon: z.number(),

    freeformAddress: z.string(),
    municipality: z.string(),
    countryCode: z.string(),
})


export type PlaceCoordinates = z.infer<typeof locationCoordinatesSchema>
export type Place = z.infer<typeof locationSchema>