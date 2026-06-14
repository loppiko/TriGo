<script setup lang="ts">
import { ReservationStatus } from '#shared/types/models/reservations/enums';
import type { BadgeProps } from '@nuxt/ui';

const props = defineProps<{
    status: ReservationStatus
    size?: 'sm' | 'md'
}>()


/**
 * Maps a reservation status to the matching Nuxt UI badge color.
 */
function statusColor(status: ReservationStatus): BadgeProps['color'] {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'neutral'
    case ReservationStatus.ASSIGNED:
        return 'secondary'
    case ReservationStatus.COMPLETED:
        return 'success'
    case ReservationStatus.CANCELLED:
        return 'error'
    }
}


/**
 * Maps a reservation status to its Polish display label.
 */
function statusLabel(status: ReservationStatus): string {
    switch (status) {
    case ReservationStatus.WAITING_FOR_ASSIGNMENT:
        return 'Oczekuje na kierowcę'
    case ReservationStatus.ASSIGNED:
        return 'Przypisano kierowcę'
    case ReservationStatus.COMPLETED:
        return 'Zakończona'
    case ReservationStatus.CANCELLED:
        return 'Anulowana'
    }
}
</script>


<template>
  <UBadge
    :color="statusColor(props.status)"
    variant='subtle'
    :size="props.size ?? 'sm'"
  >
    {{ statusLabel(props.status) }}
  </UBadge>
</template>