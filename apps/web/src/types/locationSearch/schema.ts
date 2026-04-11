import { z } from 'zod/v4'
import { FuzzySearchResultType, LocationCategoryCodeEnum } from './enum'


/**
 * Shared coordinates schema used across TomTom fuzzy-search responses.
 */
export const locationCoordinatesSchema = z.object({
    lat: z.number(),
    lon: z.number(),
})


/**
 * Simplified address object returned by fuzzy search.
 */
const fuzzyAddressSchema = z.object({
    freeformAddress: z.string(),
    municipality: z.string(),
    countrySubdivision: z.string(),
    countryCode: z.string(),
})


/**
 * POI classification schema.
 */
const poiClassificationSchema = z.object({
    code: z.enum(LocationCategoryCodeEnum),
})

/**
 * POI (Point Of Interest) details for a fuzzy result.
 */
const fuzzyPoiSchema = z.object({
    name: z.string(),
    classifications: z.array(poiClassificationSchema),
})


/**
 * Single item returned by fuzzy search.
 * @see https://developer.tomtom.com/search-api/documentation/search-service/fuzzy-search#response-data
 * @param score - Score of the result. A larger score means there is a probability that a result meeting the query criteria is higher.
 * @param poi - Information about the Points of Interest in the result. Optional section. Only present if type == POI. Uses `classifications` per TomTom Search API.
 * @param dist - Distance from the choosen location to the result in meters. Only present when geobias is provided.
 */
export const fuzzyResultSchema = z.object({
    type: z.enum(FuzzySearchResultType),
    id: z.string(),
    score: z.number(),
    dist: z.number().optional(),
    info: z.string().optional(),
    poi: fuzzyPoiSchema.optional(),
    address: fuzzyAddressSchema,
    position: locationCoordinatesSchema,
})


/**
 * Full response payload from the fuzzy-search endpoint.
 */
export const fuzzyResponseSchema = z.object({
    summary: z.object({
        query: z.string().optional(),
        queryType: z.string().optional(),
        numResults: z.number().optional(),
        totalResults: z.number().optional(),
        fuzzyLevel: z.number().optional(),
    }).optional(),
    results: z.array(fuzzyResultSchema),
})


/**
 * Primary data shape exposed by the `useLocationSearch` hook.
 */
export const queryResultsSchema = z.array(fuzzyResultSchema)


/**
 * Processed fuzzy result schema.
 */
const processedCategorySchema = z.object({
    icon: z.string(),
    description: z.string(),
})


export const processedLocationSchema = fuzzyResultSchema.extend({
    processedCategory: processedCategorySchema,
})


export type LocationCoordinates = z.infer<typeof locationCoordinatesSchema>
export type LocationFuzzyResults = z.infer<typeof queryResultsSchema>
export type FuzzyResultItem = z.infer<typeof fuzzyResultSchema>
export type ProcessedLocation = z.infer<typeof processedLocationSchema>