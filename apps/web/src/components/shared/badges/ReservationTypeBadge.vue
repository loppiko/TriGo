<script setup lang="ts">
import { PickupTypeEnum } from '#shared/types/models/reservations/enums';

const props = defineProps<{
    pickupType: PickupTypeEnum
    size?: 'sm' | 'md'
}>()

const isMeetAndGreet = ref(props.pickupType === PickupTypeEnum.MEET_AND_GREET)
</script>


<template>
  <UBadge
    :color="isMeetAndGreet ? 'primary' : 'neutral'"
    variant='outline'
    :size="props.size ?? 'sm'"
    :ui="{
      base: 'bg-white dark:bg-dark-900 text-gray-700 dark:text-gray-200'
    }"
  >
    {{ isMeetAndGreet ? 'Meet & Greet' : 'Standard Pickup' }}
  </UBadge>
</template>