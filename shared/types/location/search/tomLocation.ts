import { DEFAULT_LOCATION_CATEGORIES, POI_CATEGORY_MAPPING } from '../../../consts/geolocation/poiCategoriesMapping'
import type { Reservation } from '../../reservations/schema'
import type { Place } from '../schema'
import { TomSearchResultType, TomLocationCategoryCodeEnum } from './enum'
import type { TomLocation } from './schema'


export function reservationPickupLocationToTomLocation(reservation: Reservation): TomLocation {
    const pickupLocation = reservation.pickupLocation
    const pickupLocationName = pickupLocation.name

    const type = (pickupLocationName && pickupLocationName in POI_CATEGORY_MAPPING) ? TomSearchResultType.POI : TomSearchResultType.POINT_ADDRESS
    const category = (pickupLocationName && pickupLocationName in POI_CATEGORY_MAPPING) ? POI_CATEGORY_MAPPING[pickupLocationName as TomLocationCategoryCodeEnum] : DEFAULT_LOCATION_CATEGORIES[TomSearchResultType.POINT_ADDRESS]

    return {
        type,
        score: 1,
        id: "",
        ...pickupLocation,
        processedCategory: category
    }
}


export function reservationDestinationLocationToTomLocation(reservation: Reservation): TomLocation {
    const destinationLocation = reservation.destination
    const destinationLocationName = destinationLocation.name

    const type = (destinationLocationName && destinationLocationName in POI_CATEGORY_MAPPING) ? TomSearchResultType.POI : TomSearchResultType.POINT_ADDRESS
    const category = (destinationLocationName && destinationLocationName in POI_CATEGORY_MAPPING) ? POI_CATEGORY_MAPPING[destinationLocationName as TomLocationCategoryCodeEnum] : DEFAULT_LOCATION_CATEGORIES[TomSearchResultType.POINT_ADDRESS]

    return {
        type,
        score: 1,
        id: "",
        dist: reservation.distance,
        ...destinationLocation,
        processedCategory: category
    }
}


/**
 * Maps a TomTom TomLocation into the shared Place shape stored in Firestore.
 */
export function TomLocationToPlace(loc: TomLocation): Place {
    return {
        name: loc.poi?.name ?? loc.address.freeformAddress,
        description: loc.processedCategory.description,
        address: {
            freeformAddress: loc.address.freeformAddress,
            municipality: loc.address.municipality,
            countryCode: loc.address.countryCode,
        },
        position: {
            lat: loc.position.lat,
            lon: loc.position.lon,
        },
    }
}