<script lang="ts">
import { phoneNumberSchema } from '#shared/types/models/reservations/schema';
import { z } from 'zod'
import { type CountryCode, COUNTRY_CODES } from '~/utils/ui/countryCodes'


export const phase3Schema = z.object({
    firstName: z.string().min(1, 'Podaj imię').max(100, 'Imię jest za długie'),
    lastName: z.string().min(1, 'Podaj nazwisko').max(100, 'Nazwisko jest za długie'),
    phoneNumber: phoneNumberSchema,
})
</script>

<script setup lang="ts">

const isStepValid = defineModel<boolean>('isStepValid', { required: true })
const firstName = defineModel<string>('firstName', { required: true })
const lastName = defineModel<string>('lastName', { required: true })
const phoneNumber = defineModel<string>('phoneNumber', { required: true })
const selectedCountry = defineModel<CountryCode>('selectedCountry', { required: true })
const finalPhoneNumber = defineModel<string>('finalPhoneNumber', { required: true })

const showPhoneNumberError = ref(false)
const phoneNumberError = ref("")


defineProps<{
    customClass?: string
}>()


defineEmits<{
    goToSummary: []
}>()


const filteredCountries = computed(() => {
    const q = selectedCountry.value.countryName.toLowerCase()
    if (!q) return COUNTRY_CODES
    return COUNTRY_CODES.filter(
        (c) => c.countryName.toLowerCase().includes(q) || c.dial.includes(q),
    )
})


watch(
    [firstName, lastName, selectedCountry, phoneNumber],
    () => {
        const combinedPhoneNumber = `${selectedCountry.value.dial}${phoneNumber.value}`
        const parseResult = phase3Schema.safeParse({ firstName: firstName.value, lastName: lastName.value, phoneNumber: combinedPhoneNumber })

        if (parseResult.success) {
            finalPhoneNumber.value = combinedPhoneNumber;
            phoneNumberError.value = "";
            isStepValid.value = true;
        } else {
            console.log(parseResult.error.issues)
            phoneNumberError.value = parseResult.error.issues.find((issue) => issue.path[0] === 'phoneNumber')?.message || "";
            isStepValid.value = false;
        }
    },
    { immediate: true },
)
</script>

<template>
  <div class="py-4 mx-auto" :class="customClass ?? ''">
    <section class="text-center">
      <div class="flex flex-col items-center mb-4">
        <div class="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25 ring-4 ring-primary/10">
          3
        </div>
        <p class="mt-2.5 text-sm font-semibold text-gray-100 dark:text-gray-200">
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
          <div class="flex gap-2">
            <!-- Country code dropdown -->
            <UPopover :content="{ side: 'bottom', align: 'start' }">
              <UButton
                color="neutral"
                variant="outline"
                class="shrink-0 min-w-[90px] justify-between font-mono text-sm"
                trailing-icon="i-lucide-chevron-down"
              >
                <img :src="selectedCountry.image" :alt="selectedCountry.countryName" class="size-4" >
                <span class="font-mono">{{ selectedCountry.dial }}</span>
              </UButton>

              <template #content>
                <div class="w-48 p-2">
                  <UInput
                    v-model="selectedCountry.countryName"
                    placeholder="Szukaj kraju..."
                    icon="i-lucide-search"
                    size="sm"
                    class="mb-2"
                    autofocus
                  />
                  <ul class="max-h-52 overflow-y-auto space-y-0.5">
                    <li
                      v-for="country in filteredCountries"
                      :key="country.code"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                      :class="selectedCountry.code === country.code ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 dark:text-gray-300'"
                      @click="() => { selectedCountry = {...country}; }"
                    >
                      <img :src="country.image" :alt="country.countryName" class="size-4" >
                      <span class="font-mono">{{ country.dial }}</span>
                      <span class="text-gray-400 dark:text-gray-500 text-xs">{{ country.countryName }}</span>
                    </li>
                    <li v-if="filteredCountries.length === 0" class="px-2 py-2 text-sm text-gray-400 text-center">
                      Brak wyników
                    </li>
                  </ul>
                </div>
              </template>
            </UPopover>

            <!-- Local number input -->
            <UInput
              v-model="phoneNumber"
              type="tel"
              placeholder="123 456 789"
              icon="i-lucide-phone"
              class="flex-1"
              :color="phoneNumberError && showPhoneNumberError ? 'error' : 'primary'"
              :highlight="!!phoneNumberError && showPhoneNumberError"
              inputmode="numeric"
              @blur="showPhoneNumberError = true"
            />
          </div>
          <p v-if="phoneNumberError && showPhoneNumberError" class="text-left text-xs text-error mt-1.5">
            {{ phoneNumberError }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
