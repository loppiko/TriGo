<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full" />
    <Transition name="map-fade">
      <div v-if="!isLoaded" class="absolute inset-0">
        <USkeleton class="w-full h-full rounded-none" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const config = useRuntimeConfig()
/** Center of Trójmieście [lng, lat] */

const DEFAULT_CENTER: [number, number] = [Number(config.public.mapbox.defaultCenterLng), Number(config.public.mapbox.defaultCenterLat)]
const DEFAULT_ZOOM = Number(config.public.mapbox.defaultZoom)
const ZOOM_3D_THRESHOLD = Number(config.public.mapbox.defaultZoom3dThreshold)
const PITCH_3D = 50
const PITCH_FLAT = 0
const TRANSITION_DURATION_MS = 900

const mapContainer = ref<HTMLDivElement | null>(null)
const isLoaded = ref(false)
type MarkerType = 'pickup' | 'destination'

const MARKER_COLORS: Record<MarkerType, string> = {
    pickup: '#16a34a',
    destination: '#dc2626',
}

let map: mapboxgl.Map | null = null
let is3DActive = false
const activeMarkers = new Map<MarkerType, mapboxgl.Marker>()


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
        isLoaded.value = true
    })

    map.on('zoomend', updateCameraMode)
})

onUnmounted(() => {
    map?.remove()
    map = null
})


/** Smoothly flies the map camera to the given coordinates, sets zoom to 17, and places a marker. */
function flyTo(lat: number, lng: number, markerType: MarkerType): void {
    if (!map) return

    map.flyTo({ center: [lng, lat], zoom: 17, duration: 1500 })

    activeMarkers.get(markerType)?.remove()

    const marker = new mapboxgl.Marker({ color: MARKER_COLORS[markerType] })
        .setLngLat([lng, lat])
        .addTo(map)

    activeMarkers.set(markerType, marker)
}

defineExpose({ flyTo })
</script>

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
