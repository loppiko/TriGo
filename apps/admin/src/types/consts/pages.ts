export const ROUTES = {
    /** Główny widok rezerwacji (karty na `/`). */
    HOME: '/',
    RESERVATIONS: '/',
    RESERVATIONS_CARDS: '/',
    /** Ten sam route co `/`, przełącznik widoku przez query `view=kanban`. */
    RESERVATIONS_KANBAN: '/?view=kanban',
    DRIVERS: '/drivers',
    LOGIN: '/login',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
