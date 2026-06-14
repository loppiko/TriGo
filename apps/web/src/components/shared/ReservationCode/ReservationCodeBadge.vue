<script setup lang="ts">
import { successfulNotification } from '~/utils/notifications/toast';


const props = withDefaults(defineProps<{
    code: string
    size?: 'md' | 'lg'
}>(), {
    size: 'md',
})

const codeTextClass = computed(() => props.size === 'lg' ? 'text-xl' : 'text-sm')
const iconClass = computed(() => props.size === 'lg' ? 'size-5' : 'size-3.5')

async function copyReservationCode() {
    if (!props.code) return
    await navigator.clipboard.writeText(props.code)
    successfulNotification('Skopiowano', 'Numer rezerwacji został skopiowany do schowka')
}
</script>

<template>
  <UButton
    color="neutral"
    variant="link"
    :size="size"
    class="font-mono tracking-widest w-full group"
    :ui="{
      base: 'flex justify-between',
    }"
    @click="copyReservationCode"
  >
    <div :class="codeTextClass">
      <span class="font-mono tracking-widest text-primary group-hover:text-primary/80">
        {{ code.slice(0, 3) }}
      </span>
      <span class="mx-0.5">–</span>
      <span class="font-mono tracking-widest text-primary group-hover:text-primary/80">
        {{ code.slice(3) }}
      </span>
    </div>
    <template #trailing>
      <UIcon
        name="i-lucide-copy"
        :class="iconClass"
        class="transition-transform duration-200 group-hover:-translate-y-0.5"
      />
    </template>
  </UButton>
</template>