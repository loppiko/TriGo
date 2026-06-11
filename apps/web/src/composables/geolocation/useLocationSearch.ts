import { computed, reactive, type Ref } from 'vue'
import { getRequest } from '~/utils/useRequestBuilder'
import { ENUM_JSDOC_FILTERED_FUZZY_TYPES } from '#shared/types/models/location/search/enum'
import { fuzzyResultToProcessed } from '#shared/types/models/location/search/fuzzyResults'
import {
    fuzzyResponseSchema,
    fuzzyResultSchema,
    type TomSearchResult as LocationFuzzyResult,
    type TomLocation,
} from '#shared/types/models/location/search/schema'
import { locationCoordinatesSchema, type PlaceCoordinates } from '#shared/types/models/location/schema'


/**
 * Queries TomTom fuzzy-search when query length is greater than 3 characters.
 */
export function useLocationSearch(searchState: Ref<string>, choosenLocation: Ref<PlaceCoordinates | null>) {
    const queryResults = ref<TomLocation[]>([])
    const runtimeConfig = useRuntimeConfig()
    const tomtomConfig = runtimeConfig.public.tomtom
    const loading = ref(false)
    const choosenLocationValid = computed(() => locationCoordinatesSchema.safeParse(choosenLocation.value).success)
    let activeAbortController: AbortController | null = null

    watch(
        [searchState, choosenLocation],
        async () => {
            const normalizedQuery = searchState.value.trim()
            loading.value = true
            if (!shouldRunFuzzySearch(normalizedQuery) || !tomtomConfig.apiKey) {
                queryResults.value = []
                loading.value = false
                return
            }

            activeAbortController?.abort()
            activeAbortController = new AbortController()

            const geobias = createGeoBias(
                choosenLocationValid.value,
                choosenLocation.value,
                tomtomConfig.rectangleGeobias,
            )

            const requestResult = await fetchFuzzyResults(normalizedQuery, activeAbortController, geobias)

            if (requestResult === null) {
                loading.value = false
                return
            }

            queryResults.value = requestResult
            loading.value = false
        },
        { immediate: true },
    )

    const queryTooShort = computed(() => !shouldRunFuzzySearch(searchState.value.trim()))

    return reactive({
        queryResults,
        loading,
        queryTooShort,
    })
}


/**
 * Determines if fuzzy-search should be called.
 */
function shouldRunFuzzySearch(query: string): boolean {
    return query.length > 3
}


/**
 * Removes fuzzy-search rows that should not appear in the list: TomTom `type` values
 * annotated with `@filtered` in {@link FuzzySearchResultType}, and any address outside
 * Poland (`address.countryCode` must be `PL`).
 */
function filterRelevantFuzzyResults(results: LocationFuzzyResult[]): LocationFuzzyResult[] {
    return results.filter((item) => {
        if (ENUM_JSDOC_FILTERED_FUZZY_TYPES.has(item.type)) {
            return false
        }

        if (item.address.countryCode !== 'PL') {
            return false
        }

        return true
    })
}


/**
 * Returns a copy of fuzzy results sorted by TomTom `score` descending (higher = more relevant).
 */
function sortFuzzyResultsByScoreDescending<T extends { score: number }>(results: T[]): T[] {
    return [...results].sort((a, b) => b.score - a.score)
}


/**
 * Builds TomTom `geobias` query value: point bias around a chosen coordinate, otherwise the configured map rectangle.
 */
function createGeoBias(
    choosenLocationValid: boolean,
    choosenLocation: PlaceCoordinates | null,
    rectangleGeobias: string | undefined,
): string {
    if (choosenLocationValid && choosenLocation !== null) {
        return `point:${choosenLocation.lat},${choosenLocation.lon}`
    }

    return `rectangle:${rectangleGeobias ?? ''}`
}


/**
 * Executes TomTom fuzzy-search request and returns normalized query results.
 */
async function fetchFuzzyResults(
    query: string,
    abortController: AbortController,
    geobias: string,
): Promise<TomLocation[] | null> {
    const runtimeConfig = useRuntimeConfig()
    const tomtomConfig = runtimeConfig.public.tomtom

    try {
        const requestResult = await getRequest(
            `${tomtomConfig.fuzzySearchUrl}/${encodeURIComponent(query)}.json`,
            {
                key: tomtomConfig.apiKey,
                geobias,
                limit: tomtomConfig.fuzzySearchResponsesLimit,
                language: 'pl-PL',
                typeahead: 'true',
            },
            abortController,
        )

        if (!requestResult.success) {
            return []
        }

        const rawData = await requestResult.data.json()
        const parsedResponse = fuzzyResponseSchema.safeParse(rawData)
        if (!parsedResponse.success) {
            console.error('[fetchFuzzyResults] Failed to parse fuzzy response:', parsedResponse.error)
            return []
        }

        const validatedQueryResults = fuzzyResultSchema.array().safeParse(parsedResponse.data.results)
        if (!validatedQueryResults.success) {
            console.error('[fetchFuzzyResults] Failed to validate query results:', validatedQueryResults.error)
            return []
        }

        const filtered = filterRelevantFuzzyResults(validatedQueryResults.data)
        const sorted = sortFuzzyResultsByScoreDescending(filtered)

        return sorted.map((item) => fuzzyResultToProcessed(item))
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return null
        }

        console.error('[fetchFuzzyResults] Unexpected error:', error)
        return []
    }
}
