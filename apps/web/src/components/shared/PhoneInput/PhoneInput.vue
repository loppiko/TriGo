<script setup lang="ts">
import { phoneNumberSchema } from '#shared/types/models/reservations/schema'
import { COUNTRY_CODES, type CountryCode } from '~/utils/ui/countryCodes'


const isValid = defineModel<boolean>('isValid', { required: true })
const phoneNumber = defineModel<string>('phoneNumber', { required: true })
const selectedCountry = defineModel<CountryCode>('selectedCountry', { required: true })
const finalPhoneNumber = defineModel<string>('finalPhoneNumber', { required: true })

const phoneNumberFocused = ref(false)
const phoneNumberError = ref("")


defineProps<{
    customClass?: string
}>()


const filteredCountries = computed(() => {
    const q = selectedCountry.value.countryName.toLowerCase()
    if (!q) return COUNTRY_CODES
    return COUNTRY_CODES.filter(
        (c) => c.countryName.toLowerCase().includes(q) || c.dial.includes(q),
    )
})


watch(
    [selectedCountry, phoneNumber],
    ([country, phone]) => {
        const parseResult = phoneNumberSchema.safeParse(`${country.dial}${phone}`)

        if (parseResult.success) {
            finalPhoneNumber.value = parseResult.data;
            phoneNumberError.value = "";
            isValid.value = true;
        } else if (phoneNumberFocused.value) {
            phoneNumberError.value = (parseResult.error.issues[0]?.message || "");
            isValid.value = false;
        }
    },
    { immediate: true },
)
</script>

<template>
  <div class="py-4 mx-auto" :class="customClass ?? ''">
    <section class="text-center">
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
                    @click="selectedCountry = country;"
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
            :color="phoneNumberError ? 'error' : 'primary'"
            :highlight="!!phoneNumberError"
            inputmode="numeric"
            @blur="phoneNumberFocused = true"
          />
        </div>
        <p v-if="phoneNumberError" class="text-left text-xs text-error mt-1.5">
          {{ phoneNumberError }}
        </p>
      </div>
    </section>
  </div>
</template>
