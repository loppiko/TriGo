import { DEFAULT_LOCATION_CATEGORIES } from "#shared/consts/geolocation/poiCategoriesMapping"
import type { Result, ResultWithErrorType } from "#shared/types/core"
import type { PlaceCoordinates } from "#shared/types/models/location/schema"
import { TomSearchResultType } from "#shared/types/models/location/search/enum"
import type { TomLocation } from "#shared/types/models/location/search/schema"
import { z } from "zod/v4"


type ReverseGeocodingErrorType = "ABORTED" | "UNKNOWN_ERROR"


const reverseGeocodingSchema = z.object({
    id: z.string(),
    position: z.string(),
    address: z.object({
        postalCode: z.string(),
        municipality: z.string(),
        freeformAddress: z.string(),
        countryCode: z.string(),
    })
})


type ReverseGeocodingResponse = z.infer<typeof reverseGeocodingSchema>


export function useReverseGeocoding() {
    const loading = ref(false)
    let activeAbortController: AbortController | null = null

    
    async function callReverseGeocoding(latitude: number, longitude: number): Promise<Result<TomLocation | null>> {
        loading.value = true
        activeAbortController?.abort()
        activeAbortController = new AbortController()

        const requestResult = await fetchReverseGeocodingResults(latitude, longitude, activeAbortController)

        loading.value = false

        if (requestResult.success) {
            const processedResponse = processReverseGeocodingResponse(requestResult.data)
            if (!processedResponse.success) {
                console.warn('[callReverseGeocoding] Failed to process reverse geocoding response:', processedResponse.error)
                return { success: false, error: processedResponse.error }
            }
            return { success: true, data: processedResponse.data }
        }

        return (requestResult.errorType === 'ABORTED' 
            ? { success: true, data: null } 
            : { success: false, error: requestResult.errorMessage })
    }

    return {
        loading,
        callReverseGeocoding,
    }
}


async function fetchReverseGeocodingResults(latitude: number, longitude: number, abortController: AbortController): Promise<ResultWithErrorType<ReverseGeocodingResponse, ReverseGeocodingErrorType>> {
    const runtimeConfig = useRuntimeConfig()
    const tomtomConfig = runtimeConfig.public.tomtom

    try {
        const requestResult = await useRequestBuilder().getRequest(
            `${tomtomConfig.reverseGeocodingUrl}/${latitude},${longitude}.json`,
            {
                key: tomtomConfig.apiKey,
            },
            abortController,
        )

        if (!requestResult.success) {
            return { success: false, errorType: 'UNKNOWN_ERROR', errorMessage: requestResult.errorMessage }
        }

        const rawData = await requestResult.data.json()
        const parsedDataResult = z.array(reverseGeocodingSchema).safeParse(rawData.addresses)

        if (!parsedDataResult.success) {
            console.warn('[fetchReverseGeocodingResults] Wrong response format')
            return { success: false, errorType: 'UNKNOWN_ERROR', errorMessage: 'Wrong response format' }
        }

        if (parsedDataResult.data.length === 0) {
            console.warn('[fetchReverseGeocodingResults] No addresses found')
            return { success: false, errorType: 'UNKNOWN_ERROR', errorMessage: 'No addresses found' }
        }

        return { success: true, data: parsedDataResult.data[0]! }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return { success: false, errorType: 'ABORTED', errorMessage: 'Request aborted' }
        }

        console.error('[fetchReverseGeocodingResults] Unexpected error:', error)
        return { success: false, errorType: 'UNKNOWN_ERROR', errorMessage: 'Unexpected error' }
    }
}


function processReverseGeocodingResponse(response: ReverseGeocodingResponse): Result<TomLocation> {
    const positionResult = processStringPosition(response.position)
    if (!positionResult.success) {
        return { success: false, error: positionResult.error }
    }

    const finalData: TomLocation = {
        ...response,
        type: TomSearchResultType.POINT_ADDRESS,
        position: positionResult.data,
        score: 0,
        processedCategory: DEFAULT_LOCATION_CATEGORIES[TomSearchResultType.POINT_ADDRESS],
    }
    
    return { success: true, data: finalData }
}


function processStringPosition(position: string): Result<PlaceCoordinates> {
    const [latString, lonString] = position.split(',')
    const lat = Number(latString)
    const lon = Number(lonString)
    
    if (isNaN(lat) || isNaN(lon)) {
        return { success: false, error: 'Invalid position' }
    }

    return { success: true, data: { lat, lon } }
}