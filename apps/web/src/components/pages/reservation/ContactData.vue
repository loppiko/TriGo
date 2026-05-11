<script lang="ts">
import { z } from 'zod'


export const phase3Schema = z.object({
    firstName: z.string().min(1, 'Podaj imię').max(100, 'Imię jest za długie'),
    lastName: z.string().min(1, 'Podaj nazwisko').max(100, 'Nazwisko jest za długie'),
    phoneNumber: z.string()
        .min(9, 'Numer telefonu musi mieć co najmniej 9 cyfr')
        .regex(/^[\d\s+-]+$/, 'Podaj prawidłowy numer telefonu'),
})
</script>

<script setup lang="ts">
const firstName = defineModel<string>('firstName', { required: true })
const lastName = defineModel<string>('lastName', { required: true })
const phoneNumber = defineModel<string>('phoneNumber', { required: true })


defineProps<{
    allStepsValidAndLastVisited: boolean
}>()


defineEmits<{
    advance: []
    goToSummary: []
}>()
</script>

<template>
  <div class="w-full py-4">
    <section class="text-center">
      <div class="flex flex-col items-center mb-4">
        <div class="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25 ring-4 ring-primary/10">
          3
        </div>
        <p class="mt-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
          Dane kontaktowe
        </p>
      </div>
      <div class="rounded-2xl bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 space-y-4 shadow-sm">
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Imię</label>
          <UInput v-model="firstName" placeholder="np. Jan" icon="i-lucide-user" class="w-full" />
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Nazwisko</label>
          <UInput v-model="lastName" placeholder="np. Kowalski" icon="i-lucide-user" class="w-full" />
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Numer telefonu</label>
          <UInput v-model="phoneNumber" type="tel" placeholder="np. 123 456 789" icon="i-lucide-phone" class="w-full" />
        </div>
      </div>
      <div class="flex flex-col gap-2 mt-4">
        <UButton
          block
          :variant="allStepsValidAndLastVisited ? 'soft' : 'solid'"
          @click="$emit('advance')"
        >
          Dalej
        </UButton>
        <UButton v-if="allStepsValidAndLastVisited" block @click="$emit('goToSummary')">
          Zobacz podsumowanie
        </UButton>
      </div>
    </section>
  </div>
</template>
