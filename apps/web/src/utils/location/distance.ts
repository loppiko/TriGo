/**
 * Formats TomTom fuzzy-search `dist` (meters from the geobias point) for compact Polish UI copy.
 */
export function formatDistance(distMeters: number | undefined): string | null {
    if (distMeters === undefined || !Number.isFinite(distMeters) || distMeters < 0) {
        return null
    }

    if (distMeters < 1000) {
        return `${Math.round(distMeters)}\u00a0m`
    }

    const km = distMeters / 1000
    const formatted = new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: km >= 10 ? 0 : 1,
        minimumFractionDigits: 0,
    }).format(km)

    return `${formatted}\u00a0km`
}
