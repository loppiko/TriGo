import { DEFAULT_LOCATION_CATEGORIES, POI_CATEGORY_MAPPING } from '../../../consts/geolocation/poiCategoriesMapping'
import { TomSearchResultType, type TomLocationCategoryCodeEnum } from './enum'
import type { TomSearchResult, TomLocation } from './schema'


/**
 * Enriches a TomTom fuzzy-search row with UI metadata (`icon` + Polish `description`).
 */
export function fuzzyResultToProcessed(result: TomSearchResult): TomLocation {
    return {
        ...result,
        processedCategory: resolveProcessedCategory(result),
    }
}



/**
 * Picks `processedCategory` from POI classifications or fuzzy-search type defaults.
 */
function resolveProcessedCategory(result: TomSearchResult): TomLocation['processedCategory'] {
    if (result.type === TomSearchResultType.POI) {
        return resolvePoiProcessedCategory(result)
    }

    if (result.type === TomSearchResultType.STREET) {
        return { ...DEFAULT_LOCATION_CATEGORIES[TomSearchResultType.STREET] }
    }

    return { ...DEFAULT_LOCATION_CATEGORIES[TomSearchResultType.POINT_ADDRESS] }
}



/**
 * Uses the first TomTom `classifications[].code` when it exists in {@link POI_CATEGORY_MAPPING}; otherwise the POI default.
 */
function resolvePoiProcessedCategory(result: TomSearchResult): TomLocation['processedCategory'] {
    const fallback = { ...DEFAULT_LOCATION_CATEGORIES[TomSearchResultType.POI] }

    const classifications = result.poi?.classifications
    if (!classifications?.length) {
        return fallback
    }

    const code = classifications[0]?.code
    if (code === undefined) {
        return fallback
    }

    if (code in POI_CATEGORY_MAPPING) {
        return { ...POI_CATEGORY_MAPPING[code as TomLocationCategoryCodeEnum] }
    }

    return fallback
}
