import type { ResultWithErrorType } from "#shared/types/core";
import type { PlaceCoordinates } from "#shared/types/models/location/schema";


export type UserPositionErrorType = "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "UNKNOWN_ERROR"


export function useUserPosition() {
    return {
        getUserPosition,
    }
}


async function getUserPosition(): Promise<ResultWithErrorType<PlaceCoordinates, UserPositionErrorType>> {
    return new Promise((resolve, _) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const data: PlaceCoordinates = { lat: position.coords.latitude, lon: position.coords.longitude }
                    resolve({ success: true, data })
                },
                (error) => {
                    resolve({ success: false, errorType: resolveNavigatorGetCurrentPositionError(error), errorMessage: String(error.message) || "" })
                }, {
                    enableHighAccuracy: true,
                }
            )
        } else {
            resolve({ success: false, errorType: 'POSITION_UNAVAILABLE', errorMessage: 'Urządzenie nie obsługuje lokalizacji' })
        }
    })
}


function resolveNavigatorGetCurrentPositionError(error: GeolocationPositionError): UserPositionErrorType {
    switch (error.code) {
    case 1:
        return "PERMISSION_DENIED"
    case 2:
        return "POSITION_UNAVAILABLE"
    case 3:
        return "TIMEOUT"
    default:
        return "UNKNOWN_ERROR"
    }
}