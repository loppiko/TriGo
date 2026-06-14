<script setup lang="ts">
import FindReservationByCode from '~/components/pages/check/FindReservationByCode.vue';
import ReservationList from '~/components/pages/check/ReservationList.vue';
import GoBackButton from '~/components/shared/buttons/GoBackButton.vue';
import { useReservationStore } from '~/composables/store/reservationStore';

definePageMeta({ layout: 'reservation' })

const forceSearch = ref(false)

const showBackToReservationList = computed(() => useReservationStore().reservations.length > 0)
const showReservationList = computed(() => useReservationStore().reservations.length > 0 && !forceSearch.value)
</script>

<template>
  <div class="mx-auto max-w-3xl py-8">
    <div v-if="!showReservationList">
      <GoBackButton v-if="showBackToReservationList" :text="'Rezerwacje'" @on-click="forceSearch = false" />
      <FindReservationByCode />
    </div>

    <!-- Header -->
    <div v-else>
      <div class="flex flex-col items-center gap-6">
        <div class="text-center">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            Twoje rezerwacje
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lista sprawdzonych rezerwacji na tym urządzeniu
          </p>
        </div>
        <div class="flex shrink-0 flex-col items-center gap-1.5">
          <UButton
            icon="i-lucide-plus"
            color="primary"
            variant="soft"
            size="xl"
            square
            class="group size-12 justify-center rounded-full"
            :ui="{ leadingIcon: 'size-7 transition-transform duration-300 ease-out group-hover:-translate-y-0.5' }"
            @click="forceSearch = true"
          />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            Dodaj rezerwację
          </span>
        </div>
      </div>

      <ReservationList/>
    </div>
  </div></template>