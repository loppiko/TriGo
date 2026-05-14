<script setup lang="ts">
import ContinueButton from '~/components/shared/buttons/ContinueButton.vue'

definePageMeta({ layout: 'reservation' })

const phoneNumber = ref('')
const codePart1 = ref('')
const codePart2 = ref('')

const codePart1InputRef = ref<{ $el: HTMLElement } | null>(null)
const codePart2InputRef = ref<{ $el: HTMLElement } | null>(null)


function focusInput(inputRef: typeof codePart1InputRef.value) {
    const el = inputRef?.$el?.querySelector('input')
    el?.focus()
}


function handleCodePart1(value: string) {
    codePart1.value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)
    if (codePart1.value.length === 3) {
        focusInput(codePart2InputRef.value)
    }
}


function handleCodePart2(value: string) {
    codePart2.value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)
}


function handleCodePart2Backspace(event: KeyboardEvent) {
    if (event.key === 'Backspace' && codePart2.value.length === 0) {
        focusInput(codePart1InputRef.value)
    }
}
</script>

<template>
  <div class="h-[calc(100dvh-3.55rem)] flex flex-col items-center justify-center px-5">
    <div class="w-full max-w-sm">
      <div class="text-center mb-6">
        <div class="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 mb-3">
          <UIcon name="i-lucide-search" class="size-7 text-primary" />
        </div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Sprawdź rezerwację
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Wpisz numer telefonu i kod potwierdzenia
        </p>
      </div>

      <div class="rounded-2xl bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 mb-8 shadow-sm space-y-4">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Numer telefonu
          </label>
          <UInput
            v-model="phoneNumber"
            type="tel"
            placeholder="np. 123 456 789"
            icon="i-lucide-phone"
            size="lg"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Kod rezerwacji
          </label>
          <div class="flex items-center gap-2">
            <UInput
              ref="codePart1InputRef"
              :model-value="codePart1"
              placeholder="ABC"
              size="lg"
              class="w-full text-center font-mono tracking-widest uppercase"
              maxlength="3"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              @update:model-value="handleCodePart1"
            />
            <span class="text-lg font-semibold text-gray-400 dark:text-gray-500 shrink-0">—</span>
            <UInput
              ref="codePart2InputRef"
              :model-value="codePart2"
              placeholder="DEF"
              size="lg"
              class="w-full text-center font-mono tracking-widest uppercase"
              maxlength="3"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              @update:model-value="handleCodePart2"
              @keydown="handleCodePart2Backspace"
            />
          </div>
          <p class="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            6-znakowy kod z potwierdzenia rezerwacji
          </p>
        </div>
      </div>

      <ContinueButton 
        :disabled="phoneNumber.length < 9 || codePart1.length < 3 || codePart2.length < 3"
        text="Sprawdź rezerwację"
        @click="() => {}"
      />
    </div>
  </div>
</template>
