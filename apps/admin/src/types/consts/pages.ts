export const ROUTES = {
    HOME: '/',
    DRIVERS: '/drivers',
    LOGIN: '/login',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
