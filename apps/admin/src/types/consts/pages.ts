export const ROUTES = {
    HOME: '/',
    RESERVATIONS: '/',
    RESERVATIONS_CARDS: '/',
    RESERVATIONS_KANBAN: '/?view=kanban',
    DRIVERS: '/drivers',
    LOGIN: '/login',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
