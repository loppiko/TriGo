export const ROUTES = {
    HOME: '/',
    SUBJECTS: '/subjects',
    CLASSES: '/classes',
    TEACHERS: '/teachers',
    LOGIN: '/login',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
