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

/** Center of Trójmieście [lng, lat] */
const DEFAULT_CENTER: [number, number] = [18.6, 54.32]
const DEFAULT_ZOOM = 9
const ZOOM_3D_THRESHOLD = 15
const PITCH_3D = 50
const PITCH_FLAT = 0
const TRANSITION_DURATION_MS = 900

const config = useRuntimeConfig()
const mapContainer = ref<HTMLDivElement | null>(null)
const isLoaded = ref(false)
let map: mapboxgl.Map | null = null
let is3DActive = false


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
