import type { FetchResult } from "#shared/types/core"


export function useRequestBuilder() {
    return {
        getRequest,
    }
}


async function getRequest(url: string, queryParams?: Record<string, string>, abortController?: AbortController): Promise<FetchResult<Response>> {
    if (!isValidUrl(url)) {
        return {
            success: false,
            errorCode: 400,
            errorMessage: `Invalid URL: ${url}`,
        }
    }

    const urlObject = createUrl(url, queryParams)

    try {
        const response = await fetch(urlObject, {
            method: 'GET',
            signal: abortController?.signal,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            console.error(`[getRequest] HTTP error during GET request to ${url}: status: ${response.status}`)

            const { errorMessage, errorData } = await processErrorResponse(response)    
            return {
                success: false,
                errorCode: response.status,
                errorMessage: errorMessage,
                errorData: errorData,
            }
        }

        return {
            success: true,
            data: response,
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError' && abortController?.signal.aborted) return {
            success: false,
            errorCode: 408,
            errorMessage: 'Request aborted',
            errorData: {},
        }
        console.error('[getRequest] Error:', error)
        throw error
    }
}


async function processErrorResponse(response: Response): Promise<{ errorMessage: string, errorData: object }> {
    let errorMessage = "Unknown error message";
    let errorData = {};

    try {
        const rawText = await response.text();
        errorMessage = rawText || errorMessage;

        try {
            errorData = JSON.parse(rawText);
        } catch {
            errorData = {}
        }
    } catch {
        errorMessage = "Unknown error message"
        errorData = {}
    }

    return { errorMessage, errorData }
}



function createUrl(url: string, queryParams?: Record<string, string>): URL {
    const urlObj = new URL(url)
    if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
            urlObj.searchParams.set(key, value)
        })
    }
    return urlObj
}


function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}
