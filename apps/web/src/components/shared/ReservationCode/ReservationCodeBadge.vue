<script setup lang="ts">
import { successfulNotification } from '~/utils/notifications/toast';


const props = defineProps<{
    code: string
}>()

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
    size="md"
    class="font-mono tracking-widest w-full group"
    :ui="{
      base: 'flex justify-between',
    }"
    @click="copyReservationCode"
  >
    <div>
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
        class="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5"
      />
    </template>
  </UButton>
</template>