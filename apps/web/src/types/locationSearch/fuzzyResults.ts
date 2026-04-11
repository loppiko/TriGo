import { DEFAULT_LOCATION_CATEGORIES, POI_CATEGORY_MAPPING } from '~/types/consts/geolocation/poiCategoriesMapping'
import { FuzzySearchResultType, type LocationCategoryCodeEnum } from './enum'
import type { FuzzyResult, ProcessedLocation } from './schema'


/**
 * Enriches a TomTom fuzzy-search row with UI metadata (`icon` + Polish `description`).
 */
export function fuzzyResultToProcessed(result: FuzzyResult): ProcessedLocation {
    return {
        ...result,
        processedCategory: resolveProcessedCategory(result),
    }
}



/**
 * Picks `processedCategory` from POI classifications or fuzzy-search type defaults.
 */
function resolveProcessedCategory(result: FuzzyResult): ProcessedLocation['processedCategory'] {
    if (result.type === FuzzySearchResultType.POI) {
        return resolvePoiProcessedCategory(result)
    }

    if (result.type === FuzzySearchResultType.STREET) {
        return { ...DEFAULT_LOCATION_CATEGORIES[FuzzySearchResultType.STREET] }
    }

    return { ...DEFAULT_LOCATION_CATEGORIES[FuzzySearchResultType.POINT_ADDRESS] }
}



/**
 * Uses the first TomTom `classifications[].code` when it exists in {@link POI_CATEGORY_MAPPING}; otherwise the POI default.
 */
function resolvePoiProcessedCategory(result: FuzzyResult): ProcessedLocation['processedCategory'] {
    const fallback = { ...DEFAULT_LOCATION_CATEGORIES[FuzzySearchResultType.POI] }

    const classifications = result.poi?.classifications
    if (!classifications?.length) {
        return fallback
    }

    const code = classifications[0]?.code
    if (code === undefined) {
        return fallback
    }

    if (code in POI_CATEGORY_MAPPING) {
        return { ...POI_CATEGORY_MAPPING[code as LocationCategoryCodeEnum] }
    }

    return fallback
}
