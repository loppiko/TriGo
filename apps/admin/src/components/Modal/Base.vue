<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        title?: string
        description?: string
        class?: string
    }>(),
    {
        title: '',
        description: '',
        class: '',
    },
)

const ui = computed(() => {
    const customClass = props.class?.trim()
    return {
        ...(customClass && { content: customClass }),
        overlay: 'bg-gray-900/50 dark:bg-black/60',
        content: [
            'bg-white dark:bg-dark-800',
            'border border-gray-200 dark:border-dark-600',
            'shadow-xl',
            customClass ?? '',
        ].join(' ').trim(),
        header: 'border-b border-gray-200 dark:border-dark-600 px-4 py-3',
        title: 'text-base font-semibold text-gray-900 dark:text-gray-100',
        description: 'text-sm text-gray-500 dark:text-gray-400',
        body: 'px-4 py-4',
        footer: 'border-t border-gray-200 dark:border-dark-600 px-4 py-3 flex justify-end gap-2',
    }
})
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :ui="ui"
    dismissible
    v-bind="$attrs"
  >
    <template v-if="$slots.trigger" #default>
      <slot name="trigger" />
    </template>

    <template #body>
      <div class="[&_input]:bg-gray-50 dark:[&_input]:bg-dark-700 [&_input]:border-gray-200 dark:[&_input]:border-dark-500 [&_input]:text-gray-900 dark:[&_input]:text-gray-100 [&_input]:placeholder-gray-400 dark:[&_input]:placeholder-gray-500 [&_textarea]:bg-gray-50 dark:[&_textarea]:bg-dark-700 [&_textarea]:border-gray-200 dark:[&_textarea]:border-dark-500 [&_textarea]:text-gray-900 dark:[&_textarea]:text-gray-100 [&_textarea]:placeholder-gray-400 dark:[&_textarea]:placeholder-gray-500">
        <slot />
      </div>
    </template>

    <template #footer="{ close }">
      <slot name="footer" :close="close" />
    </template>
  </UModal>
</template>
