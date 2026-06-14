<script setup lang="ts">
import { useReservations } from '~/composables/database/reservations/useReservations'
import ContinueButton from '~/components/shared/buttons/ContinueButton.vue'
import PhoneInput from '~/components/shared/PhoneInput/PhoneInput.vue'
import { useReservationStore } from '~/composables/store/reservationStore'
import { errorNotification, warningNotification } from '~/utils/notifications/toast'
import { DEFAULT_COUNTRY_CODE, type CountryCode } from '~/utils/ui/countryCodes'

definePageMeta({ layout: 'reservation' })

const phoneNumberDraft = ref('')
const selectedCountry = ref<CountryCode>(DEFAULT_COUNTRY_CODE)
const finalPhoneNumber = ref('')
const isPhoneNumberValid = ref(false)
const codePart1 = ref('')
const codePart2 = ref('')
const loading = ref(false)

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


async function handleCheckReservation() {
    const code = codePart1.value + codePart2.value
    loading.value = true
    const result = await useReservations()
        .getReservationByCodeAndPhoneNumber(code, finalPhoneNumber.value)

    if (result.success) {
        useReservationStore().addReservation(result.data.reservation)
        navigateTo(`/check/${code}`)
    } else {
        switch (result.errorType) {
        case 'DEVICE_ID_ACCESS_LIMIT_REACHED':
            errorNotification('Dostęp zablokowany', 'Osiągnięto limit dostępu do urządzenia. Jeśli nie pamiętasz kodu, proszę skotaktuj się z nami.')
            break
        case 'RESERVATION_CODE_ACCESS_LIMIT_REACHED':
            errorNotification('Dostęp zablokowany', 'Osiągnięto limit dostępu do kodu rezerwacji. Jeśli nie pamiętasz kodu, proszę skotaktuj się z nami.')
            break
        case 'INVALID_CODE_OR_PHONE_NUMBER':
            warningNotification('Nieprawidłowy kod lub numer telefonu')
            break
        case 'FAILED_TO_GET_RESERVATION':
            errorNotification('Błąd', 'Błąd wewnętrzny aplikacji. Spróbuj ponownie później.')
            break
        case 'UNKNOWN_ERROR':
            errorNotification('Błąd', 'Błąd wewnętrzny aplikacji. Spróbuj ponownie później.')
            break
        }
    }
    loading.value = false
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center justify-center px-5">
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

      <div class="rounded-2xl bg-white/60 dark:bg-dark-800/50 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 mb-8 shadow-sm space-y-4">
        <PhoneInput
          v-model:is-valid="isPhoneNumberValid"
          v-model:phone-number="phoneNumberDraft"
          v-model:selected-country="selectedCountry"
          v-model:final-phone-number="finalPhoneNumber"
          @go-to-summary="handleCheckReservation"
        />

        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
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
        :disabled="!isPhoneNumberValid || codePart1.length < 3 || codePart2.length < 3"
        text="Sprawdź rezerwację"
        :loading="loading"
        @click="handleCheckReservation"
      />
    </div>
  </div>
</template>
