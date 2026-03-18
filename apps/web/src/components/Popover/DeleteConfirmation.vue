<script setup lang="ts">
defineProps<{
    name: string
}>()

const emit = defineEmits<{
    confirm: []
}>()
</script>

<template>
  <UPopover>
    <slot />
    <template #content>
      <div class="p-3 flex flex-col gap-3 w-48">
        <p class="text-sm text-gray-700 dark:text-gray-300">
          Usunąć <span class="font-semibold">{{ name }}</span>?
        </p>
        <div class="flex justify-end">
          <UButton size="xs" color="error" @click="emit('confirm')">
            Usuń
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
