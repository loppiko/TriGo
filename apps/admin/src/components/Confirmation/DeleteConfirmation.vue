<script setup lang="ts">
import ModalBase from '~/components/Modal/Base.vue'


const props = withDefaults(
    defineProps<{
        title?: string
        description?: string
        pending?: boolean
    }>(),
    {
        title: 'Potwierdź usunięcie',
        description: 'Tej operacji nie można cofnąć.',
        pending: false,
    },
)

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
    confirm: []
}>()
</script>

<template>
  <ModalBase
    v-model:open="open"
    :title="props.title"
    :description="props.description"
    class="max-w-md"
    :dismissible="!props.pending"
    :show-body="false"
  >
    <template #footer="{ close }">
      <UButton
        variant="ghost"
        color="neutral"
        :disabled="props.pending"
        @click="close"
      >
        Anuluj
      </UButton>
      <UButton
        color="error"
        :loading="props.pending"
        :disabled="props.pending"
        @click="emit('confirm')"
      >
        Usuń
      </UButton>
    </template>
  </ModalBase>
</template>
