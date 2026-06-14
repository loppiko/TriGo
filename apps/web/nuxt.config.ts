// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    srcDir: 'src/',
    ssr: false,

    alias: {
        '#shared': fileURLToPath(new URL('../../shared', import.meta.url)),
        '#backend': fileURLToPath(new URL('../../backend/src', import.meta.url)),
    },

    runtimeConfig: {
        public: {
            entryEnv: import.meta.env.ENTRY_ENV,
            backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL,
            supabase: {
                url: process.env.NUXT_PUBLIC_SUPABASE_URL,
                publishableKey: process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
            },
            tomtom: {
                apiKey: process.env.NUXT_PUBLIC_TOMTOM_API_KEY,
                fuzzySearchUrl: process.env.NUXT_PUBLIC_TOMTOM_FUZZY_SEARCH_URL,
                rectangleGeobias: process.env.NUXT_PUBLIC_TOMTOM_RECTANGLE_GEOBIAS,
                fuzzySearchResponsesLimit: process.env.NUXT_PUBLIC_TOMTOM_FUZZY_SEARCH_RESPONSES_LIMIT,
            },
            mapbox: {
                accessToken: process.env.NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
                defaultCenterLng: process.env.NUXT_PUBLIC_MAPBOX_DEFAULT_CENTER_LNG,
                defaultCenterLat: process.env.NUXT_PUBLIC_MAPBOX_DEFAULT_CENTER_LAT,
                defaultZoom: process.env.NUXT_PUBLIC_MAPBOX_DEFAULT_ZOOM,
                defaultZoom3dThreshold: process.env.NUXT_PUBLIC_MAPBOX_DEFAULT_ZOOM_3D_TRESHOLD,
            },
        },
    },

    vite: {
        optimizeDeps: {
            include: [
                'pinia',
                'zod',
                'mapbox-gl',
                'zod/v4',
                '@vueuse/core',
                'hono/client',
                'pinia-plugin-persistedstate'
            ],
        },
    },

    devtools: { enabled: true },
    modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui'],
    css: ['./main.css'],

    icon: {
        clientBundle: {
            icons: ['logos:google', 'logos:google-icon'],
        },
    },
})