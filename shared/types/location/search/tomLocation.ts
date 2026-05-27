import { DEFAULT_LOCATION_CATEGORIES, POI_CATEGORY_MAPPING } from '../../../consts/geolocation/poiCategoriesMapping'
import type { Reservation } from '../../reservations/schema'
import type { Place } from '../schema'
import { TomSearchResultType, TomLocationCategoryCodeEnum } from './enum'
import type { TomLocation } from './schema'


/**
 * Reconstructs a fuzzy-search-shaped TomLocation from a persisted Place (round-trip after TomLocationToPlace).
 */
function placeToTomLocation(place: Place, options: { dist?: number }): TomLocation {
    const locationName = place.name

    const type =
        locationName && locationName in POI_CATEGORY_MAPPING
            ? TomSearchResultType.POI
            : TomSearchResultType.POINT_ADDRESS

    const category =
        locationName && locationName in POI_CATEGORY_MAPPING
            ? POI_CATEGORY_MAPPING[locationName as TomLocationCategoryCodeEnum]
            : DEFAULT_LOCATION_CATEGORIES[TomSearchResultType.POINT_ADDRESS]

    const base: TomLocation = {
        type,
        score: 1,
        id: place.id ?? '',
        dist: options.dist,
        address: {
            freeformAddress: place.freeformAddress,
            municipality: place.municipality,
            countryCode: place.countryCode,
        },
        position: {
            lat: place.lat,
            lon: place.lon,
        },
        processedCategory: category,
    }

    if (type === TomSearchResultType.POI && locationName) {
        return {
            ...base,
            poi: {
                name: locationName,
                classifications: [{ code: locationName as TomLocationCategoryCodeEnum }],
            },
        }
    }

    return base
}


export function reservationPickupLocationToTomLocation(reservation: Reservation): TomLocation {
    return placeToTomLocation(reservation.pickup, {})
}


export function reservationDestinationLocationToTomLocation(reservation: Reservation): TomLocation {
    return placeToTomLocation(reservation.destination, { dist: reservation.distance })
}


/**
 * Maps a TomTom TomLocation into the shared Place shape stored in Firestore.
 */
export function TomLocationToPlace(loc: TomLocation): Place {
    return {
        name: loc.poi?.name ?? loc.address.freeformAddress,
        description: loc.processedCategory.description,
        lat: loc.position.lat,
        lon: loc.position.lon,
        freeformAddress: loc.address.freeformAddress,
        municipality: loc.address.municipality,
        countryCode: loc.address.countryCode,
    }
}