export const ROUTES = {
    HOME: '/',
    ABOUT: '/about',
    CHECK: '/check',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
