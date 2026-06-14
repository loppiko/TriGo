import type { DateTime } from "#shared/types/models/reservations/schema";


export function useDateTime() {
    return {
        formatDateTimeToHHMM,
        formatToLocaleDateString,
    }
}


/**
 * HH:MM
 */
function formatDateTimeToHHMM(dateTime: DateTime): string {
    return new Date(dateTime).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 *  <Weekday>, DD.MM.YYYY
 */
function formatToLocaleDateString(dateTime: DateTime): string {
    return new Date(dateTime).toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    })
}