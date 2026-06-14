<script setup lang="ts">
defineProps<{
    text: string
    loading?: boolean
}>()

defineEmits<{
    click: []
}>()
</script>

<template> 
  <button
    type="button"
    class="w-full max-w-[220px] mx-auto flex gap-2 items-center rounded-full bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 pl-5 hover:cursor-pointer pr-1.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-lg shadow-black/10 hover:bg-gray-50 dark:hover:bg-dark-700 hover:border-primary/30 transition-all duration-200 active:scale-95 group"
    @click="$emit('click')"
  >
    <span class="flex-1 text-center">{{ text }}</span>
    <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary group-hover:bg-primary/90 transition-colors duration-200">
      <UIcon 
        v-if="!loading"
        name="i-lucide-arrow-right" class="size-4 text-white group-hover:translate-x-0.5 transition-transform duration-200" />
      <UIcon 
        v-else
        name="i-lucide-loader-circle" class="size-4 text-white animate-spin" />
    </span>
  </button>
</template>