<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
  active?: boolean
}>(), {
    size: 45,
})

const isDarkMode = computed(() => useColorMode().value === 'dark')
</script>

<template>
  <svg :width="size" viewBox="0 0 360 520">
    <line
      x1="180"
      y1="330"
      x2="180"
      y2="500"
      stroke-width="40"
      :class="[
        active ? 'stroke-primary' : isDarkMode ? 'stroke-gray-400' : 'stroke-gray-600',
      ]"
      stroke-linecap="round"
    />
    <circle
      cx="180" cy="180" r="150" 
      :class="[
        active ? 'fill-primary stroke-gray-700' : isDarkMode ? 'fill-none stroke-gray-400' : 'fill-none stroke-gray-600']"
      stroke-width="40"
    />
    <circle
      cx="180" cy="180" r="58"
      :class="active ? 'fill-gray-700' : 'fill-primary'"
    />
    
    <circle
      v-if="active"
      cx="180" cy="500" r="20"
      class="fill-white"
    />
  </svg>
</template>