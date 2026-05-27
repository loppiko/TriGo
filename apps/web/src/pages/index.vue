<script setup lang="ts">
import { z } from 'zod'
import type { Result } from '#shared/types/core'
import { TomLocationSchema, type TomLocation } from '#shared/types/location/search/schema'
import { reservationSchema, type Reservation } from '#shared/types/reservations/schema'
import { errorNotification, infoNotification } from '~/utils/notifications/toast'
import LocationSearchInput from '~/components/shared/LocationSeachInput/LocationSearchInput.vue'
import { ReservationStatus } from '#shared/types/reservations/enums'
import type { PickupTypeEnum } from '#shared/types/reservations/enums'
import { useReservations } from '~/composables/database/reservations/useReservations'
import { TomLocationToPlace } from '#shared/types/location/search/tomLocation'
import DateTimePickup, { parseHtmlDateToLocalDate, phase2Schema } from '~/components/pages/reservation/DateTimePickup.vue'
import ContactData, { phase3Schema } from '~/components/pages/reservation/ContactData.vue'
import ReservationSummary from '~/components/pages/reservation/ReservationSummary.vue'
import Map from '~/components/shared/Map/Map.vue'
import ContinueButton from '~/components/shared/buttons/ContinueButton.vue'
import SummaryButton from '~/components/shared/buttons/SummaryButton.vue'
import ReservationButton from '~/components/shared/buttons/ReservationButton.vue'

const mapRef = ref<InstanceType<typeof Map> | null>(null)


definePageMeta({ layout: 'reservation' })

const { createReservation } = useReservations()

const RESERVATION_INTERNAL_ERROR_TITLE = 'Nieudało się wykonać rezerwacji'
const RESERVATION_INTERNAL_ERROR_DESCRIPTION =
  'Wystąpił wewnętrzny błąd aplikacji, prosimy skontaktuj się z nami.'

const pickupLocation = ref<TomLocation | undefined>()
const destination = ref<TomLocation | undefined>()
const distance = ref<number>(0)
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

    const timeParts = trimmedTime.split(':')
    pickupDate.setHours(Number(timeParts[0]), Number(timeParts[1]), 0, 0)

    const candidate: Reservation = {
        pickup: TomLocationToPlace(pickup),
        destination: TomLocationToPlace(dest),
        distance: dest.dist!,
        pickupAt: pickupDate.toISOString(),
        pickupType: type,
        clientData: {
            lastName: lastName.value.trim(),
            firstName: firstName.value.trim(),
            phoneNumber: normalizedPhone,
        },
        status: ReservationStatus.WAITING_FOR_ASSIGNMENT,
    }

    const parsed = reservationSchema.safeParse(candidate)
    if (!parsed.success) {
        console.error('[buildReservationFromWizardState] Schema validation failed:', parsed.error)
        return { success: false, error: 'Reservation schema validation failed' }
    }

    return { success: true, data: parsed.data }
}


watch(pickupLocation, (newVal) => {
    if (!newVal) return
    mapRef.value?.flyTo(newVal.position.lat, newVal.position.lon, 'pickup')
})


watch(destination, (newVal) => {
    if (!newVal) return
    mapRef.value?.flyTo(newVal.position.lat, newVal.position.lon, 'destination')
})

const phase1Schema = z.object({
    pickupLocation: TomLocationSchema,
    destination: TomLocationSchema,
}).refine((data) => data.pickupLocation.id !== data.destination.id, {
    message: 'Miejsce odbioru i cel muszą być różne',
    path: ['destination'],
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


function handleDistanceUpdated(dist: number): void {
    distance.value = dist
    if (destination.value) {
        destination.value.dist = dist
    }
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
</script>

<template>
  <div class="relative h-[calc(100vh-3.55rem)]">
    <div
      class="absolute inset-0 z-0 transition-all duration-500"
      :class="step !== 1 ? 'blur-sm pointer-events-none brightness-75' : ''"
    >
      <Map ref="mapRef" />
    </div>
    <div 
      class="flex flex-col max-w-[1200px] mx-auto px-5 relative z-10 h-max"
      :class="step !== 1 ? 'h-full' : ''"
    >
      <!-- Success screen -->
      <Transition name="success" mode="out-in">
        <div
          v-if="showSuccess"
          key="success"
          class="h-full flex flex-col relative"
        >
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
        <div v-else key="form" class="h-max-content flex flex-col relative">
          <!-- Current section - centered -->
          <div 
            class="flex-1 min-h-0 w-[calc(min(100%,700px))] relative mx-auto"
            :class="step !== 1 ? 'overflow-y-auto' : ''"
          >
            <!-- Previous phase header - clickable -->
            <Transition name="fade">
              <UButton
                v-if="previousPhaseInfo"
                color="neutral"
                variant="ghost"
                class="absolute left-0 top-0 rounded-full bg-gray-100 dark:bg-dark-700 mt-8 pl-1.5 pr-1.5 [@media(min-height:700px)]:pr-4 py-1.5 opacity-80 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-dark-600 active:scale-[0.98] group"
                @click="goToStep(previousPhaseInfo.step)"
              >
                <template #leading>
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-dark-500 group-hover:bg-gray-400 dark:group-hover:bg-dark-400 transition-colors duration-200">
                    <UIcon name="i-lucide-arrow-left" class="size-4 text-white" />
                  </span>
                </template>
                <span class="hidden [@media(min-height:700px)]:inline text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {{ previousPhaseInfo.title }}
                </span>
              </UButton>
            </Transition>
            <!-- Phase 1: Place -->
            <div v-if="step === 1" key="phase1" class="py-4">
              <section class="text-center">
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
                    @distance-updated="handleDistanceUpdated"
                  />
                </div>
              </section>
            </div>

            <div v-else class="h-full mt-4 [@media(min-height:700px)]:mt-18">
              <DateTimePickup
                v-if="step === 2"
                key="phase2"
                v-model:ride-date="rideDate"
                v-model:ride-time="rideTime"
                v-model:pickup-type="pickupType"
                custom-class="w-[calc(min(100%,700px))]"
                @go-to-summary="goToStep(4)"
              />

              <ContactData
                v-else-if="step === 3"
                key="phase3"
                v-model:first-name="firstName"
                v-model:last-name="lastName"
                v-model:phone-number="phoneNumber"
                custom-class="w-[calc(min(100%,700px))]"
                @go-to-summary="goToStep(4)"
              />

              <ReservationSummary
                v-else
                key="phase4"
                :pickup-location="pickupLocation"
                :destination="destination"
                :ride-date="rideDate"
                :ride-time="rideTime"
                :pickup-type="pickupType"
                :first-name="firstName"
                :last-name="lastName"
                :phone-number="phoneNumber"
                custom-class="w-[calc(min(100%,700px))]"
                @edit-route="goToStep(1)"
                @edit-schedule="goToStep(2)"
                @edit-contact="goToStep(3)"
                @submit-reservation="submitReservation"
              />

              <div class="w-full mx-auto pb-5 mb-5 mt-3 flex items-center gap-5">
                <SummaryButton v-if="allStepsValidAndLastVisited && step !== 4" @click="goToStep(4)" />

                <ContinueButton v-if="step === 2" text="Dalej" @click="validateAndAdvance" />

                <ContinueButton v-if="step === 3" text="Dalej" @click="validateAndAdvance" />

                <ReservationButton
                  v-if="step === 4"
                  :loading="isReservationSubmitting"
                  :disabled="isReservationSubmitting"
                  @click="submitReservation"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <div
      v-if="step === 1"
      class="w-[220px] fixed bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-5"
    >
      <ContinueButton v-if="pickupLocation && destination" text="Dalej" @click="validateAndAdvance" />
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
