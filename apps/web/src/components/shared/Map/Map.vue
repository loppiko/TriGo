<script setup lang="ts">
import type { PlaceCoordinates } from '#shared/types/models/location/schema'
import type { Result, ResultWithErrorType } from '#shared/types/core'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import ManualPinIcon from '~/components/shared/icons/ManualPinIcon.vue'
import { errorNotification } from '~/utils/notifications/toast'
import { useUserPosition, type UserPositionErrorType } from '~/composables/geolocation/useUserPosition'
import type { LocationType } from '~/types/location/locationType'


const emit = defineEmits<{
  (e: 'onLoaded'): void
  (e: 'onUserPositionUpdated', positionResult: ResultWithErrorType<PlaceCoordinates, UserPositionErrorType>): void
}>()


const _ = defineProps<{
    showGetUserPositionButton: boolean
    placeLocationButtonHigh: boolean
    userLocationPermissionsDenied: boolean
}>()


const config = useRuntimeConfig()

/** Center of Trójmieście [lng, lat] */
const DEFAULT_CENTER: [number, number] = [Number(config.public.mapbox.defaultCenterLng), Number(config.public.mapbox.defaultCenterLat)]
const DEFAULT_ZOOM = Number(config.public.mapbox.defaultZoom)
const ZOOM_3D_THRESHOLD = Number(config.public.mapbox.defaultZoom3dThreshold)
const PITCH_3D = 50
const PITCH_FLAT = 0
const TRANSITION_DURATION_MS = 900
const MAP_ANIMATION_LOADING_DURATION_MS = 600
const MARKER_COLORS: Record<LocationType, string> = {
    pickup: '#16a34a',
    destination: '#dc2626',
}

const mapContainer = ref<HTMLDivElement | null>(null)
const isLoaded = ref(false)
const isManualModeActive = ref(false)
const isUserLocationLoading = ref(false)
const currentLat = defineModel<number | undefined>('currentLat')
const currentLon = defineModel<number | undefined>('currentLon')


let map: mapboxgl.Map | null = null
let is3DActive = false
const activeMarkers = new Map<LocationType, mapboxgl.Marker>()


onMounted(() => {
    if (!mapContainer.value) return

    mapboxgl.accessToken = config.public.mapbox.accessToken as string

    map = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/random-scala-dev/cmp11usd6001h01r00acl4623',
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
    })

    map.addControl(new mapboxgl.AttributionControl({ compact: true }))

    map.on('load', () => {
        setTimeout(() => {
            isLoaded.value = true
            emit('onLoaded')
        }, MAP_ANIMATION_LOADING_DURATION_MS)
    })

    map.on('zoomend', updateCameraMode)
})

onUnmounted(() => {
    map?.off('move', useManualMode().syncCenterCoordinates)
    map?.remove()
    map = null
})


/** Smoothly flies the map camera to the given coordinates, sets zoom to 17, and places a marker. */
function flyTo(lat: number, lng: number, locationType: LocationType | null): void {
    if (!map) return

    map.flyTo({ center: [lng, lat], zoom: 17, duration: 1500 })
    if (!locationType) return
    
    activeMarkers.get(locationType)?.remove()

    const marker = new mapboxgl.Marker({ color: MARKER_COLORS[locationType] })
        .setLngLat([lng, lat])
        .addTo(map)

    activeMarkers.set(locationType, marker)
}


/** Transitions the map camera into 3D building view or back to flat based on current zoom. */
function updateCameraMode(): void {
    if (!map) return

    const zoom = map.getZoom()
    const shouldBe3D = zoom > ZOOM_3D_THRESHOLD

    if (shouldBe3D && !is3DActive) {
        is3DActive = true
        map.easeTo({ pitch: PITCH_3D, duration: TRANSITION_DURATION_MS })
    }
    else if (!shouldBe3D && is3DActive) {
        is3DActive = false
        map.easeTo({ pitch: PITCH_FLAT, duration: TRANSITION_DURATION_MS })
    }
}


async function onUserPosition() {
    isUserLocationLoading.value = true
    const result = await useUserPosition().getUserPosition()
    isUserLocationLoading.value = false
    emit('onUserPositionUpdated', result)
}


function useManualMode() {
    /** Writes the map viewport center into the lat/lng v-models. */
    function syncCenterCoordinates(): void {
        if (!map) return

        const center = map.getCenter()
        currentLat.value = center.lat
        currentLon.value = center.lng
    }


    /** Enables manual location picking with a fixed center pin and live coordinate updates while panning. */
    function enableManualMode(): void {
        if (!map) {
            console.error('[enableManualMode] Map not initialized')
            errorNotification('Wystąpił problem podczas ładowania mapy')
            return
        }

        if (isManualModeActive.value) return

        isManualModeActive.value = true
        syncCenterCoordinates()
        map.on('move', syncCenterCoordinates)
    }


    /** Disables manual location picking and stops live coordinate updates. */
    function disableManualMode(): void {
        if (!map || !isManualModeActive.value) return

        isManualModeActive.value = false
        map.off('move', syncCenterCoordinates)
    }

    return {
        enableManualMode,
        disableManualMode,
        syncCenterCoordinates,
    }
}


function drawRoute(geojson: GeoJSON.Feature<GeoJSON.Geometry>): void {
    if (!map) return

    if (map.getLayer('route')) map.removeLayer('route')
    if (map.getLayer('route-casing')) map.removeLayer('route-casing')
    if (map.getSource('route')) map.removeSource('route')

    map.addSource('route', {
        type: 'geojson',
        data: geojson,
    })

    // Wider underlay for contrast on dark 3D styles
    map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
        },
        paint: {
            'line-color': '#1a3d6b',
            'line-width': 8,
            'line-opacity': 0.6,
            'line-emissive-strength': 1,
        },
    })

    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
        },
        paint: {
            'line-color': '#326ba8',
            'line-width': 5,
            'line-opacity': 1,
            'line-emissive-strength': 1,
        },
    })
}


async function getRoute(from: PlaceCoordinates, to: PlaceCoordinates): Promise<Result<{distance: number}>> {
    function buildRouteUrl(from: PlaceCoordinates, to: PlaceCoordinates): string {
        // Mapbox Directions API expects {longitude},{latitude}
        return `${config.public.mapbox.routeUrl}/${from.lon},${from.lat};${to.lon},${to.lat}`
    }

    if (!map) {
        console.error('[getRoute] Map not initialized')
        return { success: false, error: 'Map not initialized' }
    }

    const result = await useRequestBuilder().getRequest(
        buildRouteUrl(from, to),
        {
            access_token: config.public.mapbox.accessToken,
            geometries: 'geojson',
            steps: 'false',
            overview: 'full',
        }
    )

    if (!result.success) {
        console.error('[getRoute] Failed to get route:', result.errorMessage)
        return { success: false, error: result.errorMessage }
    }

    try {
        const data = await result.data.json()
        const route = data.routes[0]
        const geometry: GeoJSON.Geometry = route.geometry
        const distance = route.distance as number

        const geojson: GeoJSON.Feature<GeoJSON.Geometry> = {
            type: 'Feature',
            properties: {},
            geometry,
        }

        drawRoute(geojson)

        return { success: true, data: { distance } }
    } catch (error) {
        console.error('[getRoute] Failed to parse route data:', error)
        return { success: false, error: 'Failed to parse route data' }
    }
}

defineExpose({ flyTo, getRoute, useManualMode, loaded: isLoaded })
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full" />
    <div
      v-if="isManualModeActive"
      class="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full"
      aria-hidden="true"
    >
      <ManualPinIcon :size="60" :active="true" />
    </div>
    <button
      v-if="showGetUserPositionButton"
      type="button"
      :disabled="isUserLocationLoading"

      class="pointer-events-auto absolute right-16 bottom-19 [@media(max-width:530px)]:right-8 flex items-center justify-center z-10 size-14 rounded-full bg-white dark:bg-dark-800 shadow-lg shadow-black/15 border border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 active:scale-95 transition-all duration-200"
      :class="{ '[@media(max-width:530px)]:bottom-48': placeLocationButtonHigh }"
      aria-label="Moja lokalizacja"
      @click="onUserPosition"
    >
      <UIcon
        :name="isUserLocationLoading ? 'i-lucide-loader-circle' : 'i-lucide-locate-fixed'"
        class="size-7"
        :class="{ 'text-primary-600 dark:text-primary-400': !userLocationPermissionsDenied, 'text-gray-400 dark:text-gray-400': userLocationPermissionsDenied, 'animate-spin': isUserLocationLoading }" />
    </button>
    <Transition name="map-fade">
      <div v-if="!isLoaded" class="absolute inset-0">
        <USkeleton class="w-full h-full rounded-none" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.map-fade-enter-active,
.map-fade-leave-active {
  transition: opacity 0.6s ease;
}

.map-fade-enter-from,
.map-fade-leave-to {
  opacity: 0;
}
</style>
