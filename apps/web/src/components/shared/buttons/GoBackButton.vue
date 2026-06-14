<script setup lang="ts">
defineProps<{
    text: string
    hideTextOnMobile?: boolean
}>()

defineEmits<{
    onClick: []
}>()
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    class="rounded-full bg-gray-100 dark:bg-dark-700 pl-1.5 pr-4 py-1.5 opacity-80 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-dark-600 active:scale-[0.98] group"
    :class="{ 'pl-1.5 pr-1.5 py-1.5': hideTextOnMobile }"
    @click="$emit('onClick')"
  >
    <template #leading>
      <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-dark-500 group-hover:bg-gray-400 dark:group-hover:bg-dark-400 transition-colors duration-200">
        <UIcon name="i-lucide-arrow-left" class="size-4 text-white transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
      </span>
    </template>
    <span
      class="text-sm font-semibold text-gray-500 dark:text-gray-400"
      :class="{ 'hidden [@media(min-height:700px)]:inline': hideTextOnMobile }"
    >
      {{ text }}
    </span>
  </UButton>
</template>