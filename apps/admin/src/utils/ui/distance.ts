/**
 * Formats a route length given in meters for Polish UI: whole meters below 1 km,
 * kilometers with at most one decimal when longer.
 */
export function formatRouteDistanceMeters(meters: number | undefined | null): string {
    if (meters === undefined || meters === null || !Number.isFinite(meters) || meters < 0) {
        return '—'
    }

    if (meters < 1000) {
        return `${Math.round(meters).toLocaleString('pl-PL')} m`
    }

    const km = meters / 1000
    return `${km.toLocaleString('pl-PL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    })} km`
}
