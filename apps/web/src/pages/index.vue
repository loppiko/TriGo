<script setup lang="ts">
import { z } from 'zod'
import type { Result } from '#shared/types/core'
import { TomLocationSchema, type TomLocation } from '#shared/types/location/search/schema'
import { reservationSchema, type Reservation } from '#shared/types/reservations/schema'
import { errorNotification, infoNotification } from '~/utils/notifications/toast'
import LocationSearchInput from '~/components/LocationSeachInput/LocationSearchInput.vue'
import { PickupTypeEnum, ReservationStatus } from '#shared/types/reservations/enums'
import { useReservations } from '~/composables/database/useReservations'
import { TomLocationToPlace } from '#shared/types/location/search/tomLocation'
import { pickupTypeOptions } from '~/utils/ui/reservations'


definePageMeta({ layout: 'home' })

const { createReservation } = useReservations()

const RESERVATION_INTERNAL_ERROR_TITLE = 'Nieudało się wykonać rezerwacji'
const RESERVATION_INTERNAL_ERROR_DESCRIPTION =
  'Wystąpił wewnętrzny błąd aplikacji, prosimy skontaktuj się z nami.'

const pickupLocation = ref<TomLocation | undefined>()
const destination = ref<TomLocation | undefined>()
const rideDate = ref('')
const rideTime = ref('')
const pickupType = ref<PickupTypeEnum | null>(null)
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')

const step = ref(1)
const showSuccess = ref(false)
const isReservationSubmitting = ref(false)


/**
 * Parses an HTML `input[type="date"]` value (`YYYY-MM-DD`) into a local calendar date.
 */
function parseHtmlDateToLocalDate(isoDate: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
        return null
    }

    const parts = isoDate.split('-').map(Number)
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    if (year == null || month == null || day == null) {
        return null
    }
    return new Date(year, month - 1, day)
}


/**
 * Builds a reservation from current wizard state and validates it against reservationSchema.
 */
function buildReservationFromWizardState(): Result<Reservation> {
    const pickup = pickupLocation.value
    const dest = destination.value
    const type = pickupType.value

    if (!pickup || !dest || type == null) {
        console.error('[buildReservationFromWizardState] Missing required wizard fields')
        return { success: false, error: 'Missing required wizard fields' }
    }

    const pickupDate = parseHtmlDateToLocalDate(rideDate.value.trim())
    if (!pickupDate) {
        console.error('[buildReservationFromWizardState] Invalid ride date:', rideDate.value)
        return { success: false, error: 'Invalid ride date' }
    }

    const trimmedTime = rideTime.value.trim()
    if (!trimmedTime) {
        console.error('[buildReservationFromWizardState] Empty ride time')
        return { success: false, error: 'Empty ride time' }
    }

    const normalizedPhone = phoneNumber.value.replace(/\s/g, '')

    const candidate: Reservation = {
        pickupLocation: TomLocationToPlace(pickup),
        destination: TomLocationToPlace(dest),
        pickupDate,
        pickupTime: trimmedTime,
        distance: dest.dist!,
        status: ReservationStatus.WAITING_FOR_ASSIGNMENT,
        pickupType: type,
        clientDetails: {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            phoneNumber: normalizedPhone,
        },
    }

    const parsed = reservationSchema.safeParse(candidate)
    if (!parsed.success) {
        console.error('[buildReservationFromWizardState] Schema validation failed:', parsed.error)
        return { success: false, error: 'Reservation schema validation failed' }
    }

    return { success: true, data: parsed.data }
}


const phase1Schema = z.object({
    pickupLocation: TomLocationSchema,
    destination: TomLocationSchema,
}).refine((data) => data.pickupLocation.id !== data.destination.id, {
    message: 'Miejsce odbioru i cel muszą być różne',
    path: ['destination'],
})


/**
 * `UInput` `type="date"` supplies `YYYY-MM-DD` strings; we parse to the same local {@link Date} used for {@link reservationSchema} `pickupDate`.
 */
const phase2RideDateSchema = z
    .string()
    .trim()
    .min(1, 'Wybierz datę przejazdu')
    .refine((s) => parseHtmlDateToLocalDate(s) !== null, { message: 'Wybierz datę przejazdu' })
    .transform((s) => parseHtmlDateToLocalDate(s)!)


const phase2Schema = z.object({
    rideDate: phase2RideDateSchema,
    rideTime: z.iso.time().min(1, 'Wybierz godzinę przejazdu'),
    pickupType: z.enum(PickupTypeEnum),
})


const phase3Schema = z.object({
    firstName: z.string().min(1, 'Podaj imię').max(100, 'Imię jest za długie'),
    lastName: z.string().min(1, 'Podaj nazwisko').max(100, 'Nazwisko jest za długie'),
    phoneNumber: z.string()
        .min(9, 'Numer telefonu musi mieć co najmniej 9 cyfr')
        .regex(/^[\d\s+-]+$/, 'Podaj prawidłowy numer telefonu'),
})


const phaseTitles: Record<number, string> = {
    1: 'Skąd i dokąd?',
    2: 'Kiedy i jak?',
    3: 'Dane kontaktowe',
    4: 'Podsumowanie',
}


const previousPhaseInfo = computed(() => {
    if (step.value <= 1) return null
    const prevStep = step.value - 1
    return { step: prevStep, title: phaseTitles[prevStep] }
})


const isStep1Valid = computed(() =>
    phase1Schema.safeParse({
        pickupLocation: pickupLocation.value,
        destination: destination.value,
    }).success,
)


const isStep2Valid = computed(() =>
    phase2Schema.safeParse({
        rideDate: rideDate.value,
        rideTime: rideTime.value,
        pickupType: pickupType.value,
    }).success,
)


const isStep3Valid = computed(() =>
    phase3Schema.safeParse({
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        phoneNumber: phoneNumber.value.replace(/\s/g, ''),
    }).success,
)


const steps4Visited = ref<boolean>(false)


const allStepsValidAndLastVisited = computed(() =>
    isStep1Valid.value && isStep2Valid.value && isStep3Valid.value && steps4Visited.value,
)


function goToStep(targetStep: number) {
    if (targetStep === 4) {
        steps4Visited.value = true
    }
    step.value = targetStep
}


function validateAndAdvance() {
    if (step.value === 1) {
        const result = phase1Schema.safeParse({
            pickupLocation: pickupLocation.value,
            destination: destination.value,
        })
        if (!result.success) {
            const firstError = result.error.issues[0]?.message ?? 'Uzupełnij wymagane pola'
            infoNotification('Popraw błędy w formularzu', firstError)
            return
        }
        step.value = 2
    }
    else if (step.value === 2) {
        const result = phase2Schema.safeParse({
            rideDate: rideDate.value,
            rideTime: rideTime.value,
            pickupType: pickupType.value,
        })
        if (!result.success) {
            const firstError = result.error.issues[0]?.message ?? 'Uzupełnij wymagane pola'
            infoNotification('Popraw błędy w formularzu', firstError)
            return
        }
        step.value = 3
    }
    else if (step.value === 3) {
        const result = phase3Schema.safeParse({
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            phoneNumber: phoneNumber.value.replace(/\s/g, ''),
        })
        if (!result.success) {
            const firstError = result.error.issues[0]?.message ?? 'Uzupełnij wymagane pola'
            infoNotification('Popraw błędy w formularzu', firstError)
            return
        }
        step.value = 4
        steps4Visited.value = true
    }
}


function handlePickupLocationSelected(location: TomLocation) {
    pickupLocation.value = location
}


function handleDestinationSelected(location: TomLocation) {
    destination.value = location
}


/**
 * Validates wizard state into a reservation payload, persists it, or shows an internal-error toast on failure.
 */
async function submitReservation() {
    if (step.value !== 4) {
        return
    }

    const built = buildReservationFromWizardState()

    if (!built.success) {
        errorNotification(RESERVATION_INTERNAL_ERROR_TITLE, RESERVATION_INTERNAL_ERROR_DESCRIPTION)
        return
    }

    isReservationSubmitting.value = true
    const result = await createReservation(built.data)
    
    if (!result.success) {
        errorNotification(RESERVATION_INTERNAL_ERROR_TITLE, RESERVATION_INTERNAL_ERROR_DESCRIPTION)
        isReservationSubmitting.value = false
        return
    }
    
    showSuccess.value = true
    isReservationSubmitting.value = false
}



/**
 * Single-line label for summary UI (TomTom processed location).
 */
function locationDisplayLabel(location: TomLocation | undefined): string {
    if (!location) {
        return ''
    }

    return location.poi?.name?.trim()
        ?? location.address.freeformAddress?.trim()
        ?? [location.address.municipality]
            .filter((value): value is string => Boolean(value))
            .join(', ')
        ?? '—'
}


const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50/40 to-white dark:from-dark-950 dark:to-dark-900">
    <div class="min-h-screen flex flex-col max-w-md mx-auto px-5 relative">
      <!-- Success screen -->
      <Transition name="success" mode="out-in">
        <div
          v-if="showSuccess"
          key="success"
          class="min-h-screen flex flex-col relative"
        >
          <!-- Logo at top -->
          <div class="logo-container logo-top text-center">
            <div class="inline-flex items-center gap-3 mb-1">
              <div class="size-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <UIcon name="i-lucide-map-pin" class="size-5 text-white" />
              </div>
              <span class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Tri<span class="text-primary">Go</span>
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Zarezerwuj przejazd w Trójmieście
            </p>
          </div>

          <!-- Spacer for logo -->
          <div class="shrink-0 h-[100px]" aria-hidden />

          <!-- Success content - centered -->
          <div class="flex-1 flex flex-col items-center justify-center px-5 py-8 pb-16">
            <div class="w-full max-w-sm">
              <!-- Success Card -->
              <div class="rounded-2xl bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-8 shadow-lg">
                <div class="flex flex-col items-center text-center">
                  <div class="success-checkmark">
                    <div class="success-checkmark-circle size-24 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-green-600 shadow-[0_20px_40px_-12px_rgb(22_163_74/0.4)]">
                      <UIcon name="i-lucide-check" class="size-14 text-white" />
                    </div>
                  </div>
                  <h1 class="success-title mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                    Gotowe! <br> Przejazd zarezerwowany
                  </h1>
                  <p class="success-desc mt-4 font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    Teraz możesz odetchnąć,<br>my zajmiemy się resztą.
                  </p>
                  <p class="success-desc mt-4 text-right w-full tracking-tight text-gray-500 dark:text-gray-400">
                    Do zobaczenia, zespół Tri<span class="text-primary">Go</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form flow -->
        <div v-else key="form" class="min-h-screen flex flex-col relative">
          <!-- Logo - position animates: centered in step 1, top in step 2+ -->
          <div
            class="logo-container text-center"
            :class="step === 1 ? 'logo-centered' : 'logo-top'"
          >
            <div class="inline-flex items-center gap-3 mb-1">
              <div class="size-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <UIcon name="i-lucide-map-pin" class="size-5 text-white" />
              </div>
              <span class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Tri<span class="text-primary">Go</span>
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Zarezerwuj przejazd w Trójmieście
            </p>
          </div>

          <!-- Spacer for logo when at top (step 2+) -->
          <div
            v-if="step > 1"
            class="shrink-0 h-[100px]"
            aria-hidden
          />

          <!-- Previous phase header - clickable -->
          <Transition name="fade">
            <button
              v-if="previousPhaseInfo"
              type="button"
              class="shrink-0 flex items-center justify-center gap-2 w-full opacity-60 hover:opacity-80 transition-opacity active:scale-[0.98] rounded-lg border border-dashed border-gray-300 dark:border-dark-600 py-2.5 px-3"
              @click="goToStep(previousPhaseInfo.step)"
            >
              <span class="size-7 rounded-full bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 shrink-0">
                {{ previousPhaseInfo.step }}
              </span>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ previousPhaseInfo.title }}
              </span>
            </button>
          </Transition>

          <!-- Current section - centered -->
          <div class="flex-1 flex flex-col items-center justify-center min-h-0 pb-12 w-full">
            <Transition name="phase" mode="out-in">
              <!-- Phase 1: Place -->
              <div v-if="step === 1" key="phase1" class="w-full py-4">
                <section class="text-center">
                  <div class="flex flex-col items-center mb-4">
                    <div class="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25 ring-4 ring-primary/10">
                      1
                    </div>
                    <p class="mt-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Skąd i dokąd?
                    </p>
                  </div>
                  <div class="rounded-2xl bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 shadow-sm">
                    <LocationSearchInput
                      v-model:from-model-value="pickupLocation"
                      v-model:to-model-value="destination"
                      from-label="Miejsce odbioru"
                      to-label="Cel podróży"
                      placeholder="Wpisz lub wybierz lokalizację..."
                      to-placeholder="Dokąd jedziesz?"
                      icon="i-lucide-map-pin"
                      to-icon="i-lucide-navigation"
                      @from-location-selected="handlePickupLocationSelected"
                      @to-location-selected="handleDestinationSelected"
                    />
                  </div>
                  <div class="flex flex-col gap-2 mt-4">
                    <UButton
                      block
                      :variant="allStepsValidAndLastVisited ? 'soft' : 'solid'"
                      @click="validateAndAdvance"
                    >
                      Dalej
                    </UButton>
                    <UButton 
                      v-if="allStepsValidAndLastVisited"
                      block 
                      @click="goToStep(4)">
                      Zobacz podsumowanie
                    </UButton>
                  </div>
                </section>
              </div>

              <!-- Phase 2: Date/Time & Pickup Type -->
              <div v-else-if="step === 2" key="phase2" class="w-full py-4">
                <section class="text-center">
                  <div class="flex flex-col items-center mb-4">
                    <div class="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25 ring-4 ring-primary/10">
                      2
                    </div>
                    <p class="mt-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Kiedy i jak?
                    </p>
                  </div>
                  <div class="rounded-2xl bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 space-y-5 shadow-sm">
                    <div class="flex flex-col gap-3">
                      <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Data</label>
                        <UInput v-model="rideDate" type="date" icon="i-lucide-calendar" class="w-full" />
                      </div>
                      <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Godzina</label>
                        <UInput v-model="rideTime" type="time" icon="i-lucide-clock" class="w-full" />
                      </div>
                    </div>

                    <div>
                      <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 block">
                        Forma odbioru
                      </label>
                      <div class="space-y-3">
                        <button
                          v-for="option in pickupTypeOptions"
                          :key="option.value"
                          class="w-full text-left p-4 rounded-xl border-2 transition-all duration-300 active:scale-[0.98]"
                          :class="pickupType === option.value
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm shadow-primary/10'
                            : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'"
                          @click="pickupType = option.value"
                        >
                          <div class="flex items-start gap-3">
                            <div
                              class="size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                              :class="pickupType === option.value
                                ? 'bg-primary/10 text-primary'
                                : 'bg-gray-100 dark:bg-dark-700 text-gray-400'"
                            >
                              <UIcon :name="option.icon" class="size-5" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="font-bold text-sm text-gray-900 dark:text-white">{{ option.title }}</p>
                              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                {{ option.description }}
                              </p>
                            </div>
                            <Transition name="check">
                              <UIcon
                                v-if="pickupType === option.value"
                                name="i-lucide-circle-check"
                                class="size-5 text-primary shrink-0 mt-0.5"
                              />
                            </Transition>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2 mt-4">
                    <UButton
                      block
                      :variant="allStepsValidAndLastVisited ? 'soft' : 'solid'"
                      @click="validateAndAdvance"
                    >
                      Dalej
                    </UButton>
                    <UButton v-if="allStepsValidAndLastVisited" block @click="goToStep(4)">
                      Zobacz podsumowanie
                    </UButton>
                  </div>
                </section>
              </div>

              <!-- Phase 3: Contact Details -->
              <div v-else-if="step === 3" key="phase3" class="w-full py-4">
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
                      @click="validateAndAdvance"
                    >
                      Dalej
                    </UButton>
                    <UButton v-if="allStepsValidAndLastVisited" block @click="goToStep(4)">
                      Zobacz podsumowanie
                    </UButton>
                  </div>
                </section>
              </div>

              <!-- Phase 4: Summary -->
              <div v-else key="phase4" class="w-full py-4 pb-8">
                <section class="text-center">
                  <div class="flex flex-col items-center mb-4">
                    <div class="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25 ring-4 ring-primary/10">
                      4
                    </div>
                    <p class="mt-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Podsumowanie
                    </p>
                  </div>

                  <div class="rounded-2xl bg-gradient-to-br from-white/90 to-green-50/60 dark:from-dark-800/90 dark:to-primary/5 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 shadow-sm text-left">
                    <div class="space-y-4">
                      <div class="flex items-start gap-3">
                        <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <UIcon name="i-lucide-map-pin" class="size-5 text-primary" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs text-gray-500 dark:text-gray-400">Trasa</p>
                          <p class="text-sm font-semibold text-gray-900 dark:text-white">
                            {{ locationDisplayLabel(pickupLocation) }}
                          </p>
                          <div class="flex items-center gap-1.5 mt-0.5">
                            <UIcon name="i-lucide-arrow-right" class="size-3 text-gray-400 shrink-0" />
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              {{ locationDisplayLabel(destination) }}
                            </p>
                          </div>
                        </div>
                        <UButton
                          icon="i-lucide-pencil"
                          variant="soft"
                          color="primary"
                          size="sm"
                          aria-label="Edytuj trasę"
                          class="shrink-0"
                          @click="goToStep(1)"
                        />
                      </div>

                      <div class="h-px bg-gray-200 dark:bg-dark-600" />

                      <div class="flex items-start gap-3">
                        <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <UIcon name="i-lucide-calendar" class="size-5 text-primary" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs text-gray-500 dark:text-gray-400">Termin</p>
                          <p class="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                            {{ formatDate(rideDate) }}
                          </p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Godzina: {{ rideTime }}
                          </p>
                        </div>
                        <UButton
                          icon="i-lucide-pencil"
                          variant="soft"
                          color="primary"
                          size="sm"
                          aria-label="Edytuj termin"
                          class="shrink-0"
                          @click="goToStep(2)"
                        />
                      </div>

                      <div class="h-px bg-gray-200 dark:bg-dark-600" />

                      <div class="flex items-start gap-3">
                        <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <UIcon
                            :name="pickupType === 'meet-greet' ? 'i-lucide-handshake' : 'i-lucide-car'"
                            class="size-5 text-primary"
                          />
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs text-gray-500 dark:text-gray-400">Forma odbioru</p>
                          <p class="text-sm font-semibold text-gray-900 dark:text-white">
                            {{ pickupType === 'meet-greet' ? 'Meet & Greet' : 'Standard Pickup' }}
                          </p>
                        </div>
                        <UButton
                          icon="i-lucide-pencil"
                          variant="soft"
                          color="primary"
                          size="sm"
                          aria-label="Edytuj formę odbioru"
                          class="shrink-0"
                          @click="goToStep(2)"
                        />
                      </div>

                      <div class="h-px bg-gray-200 dark:bg-dark-600" />

                      <div class="flex items-start gap-3">
                        <div class="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <UIcon name="i-lucide-user" class="size-5 text-primary" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs text-gray-500 dark:text-gray-400">Dane kontaktowe</p>
                          <p class="text-sm font-semibold text-gray-900 dark:text-white">
                            {{ firstName }} {{ lastName }}
                          </p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {{ phoneNumber }}
                          </p>
                        </div>
                        <UButton
                          icon="i-lucide-pencil"
                          variant="soft"
                          color="primary"
                          size="sm"
                          aria-label="Edytuj dane kontaktowe"
                          class="shrink-0"
                          @click="goToStep(3)"
                        />
                      </div>
                    </div>
                    <UButton
                      block
                      size="xl"
                      class="mt-6"
                      :loading="isReservationSubmitting"
                      :disabled="isReservationSubmitting"
                      @click="submitReservation"
                    >
                      Zarezerwuj przejazd
                    </UButton>
                  </div>
                </section>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.logo-container {
  position: absolute;
  left: 0;
  right: 0;
  transition: top 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.logo-centered {
  top: calc(50% - 280px);
  transform: translateY(-50%);
}

@media (min-height: 751px) {
  .logo-centered {
    top: calc(50% - 300px);
  }
}

.logo-top {
  top: 1.5rem;
  transform: translateY(0);
}

.phase-enter-active,
.phase-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.phase-enter-from,
.phase-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.check-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.check-enter-from {
  opacity: 0;
  transform: scale(0);
}

/* Success screen */
.success-enter-active,
.success-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.success-enter-from,
.success-leave-to {
  opacity: 0;
}

.success-enter-from .success-checkmark,
.success-leave-to .success-checkmark {
  transform: scale(0.5);
  opacity: 0;
}

.success-checkmark {
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s,
    opacity 0.5s ease 0.1s;
}

.success-checkmark-circle {
  animation: success-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

@keyframes success-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  animation: success-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.success-desc {
  animation: success-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
}

@keyframes success-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
