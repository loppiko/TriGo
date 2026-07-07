<script setup lang="ts">
import { z } from 'zod'
import type { Result } from '#shared/types/core'
import { TomLocationSchema, type TomLocation } from '#shared/types/models/location/search/schema'
import { dateTimeSchema, reservationSchema, type DateTime, type Reservation } from '#shared/types/models/reservations/schema'
import { errorNotification, infoNotification, warningNotification } from '~/utils/notifications/toast'
import LocationSearchInput from '~/components/shared/LocationSeachInput/LocationSearchInput.vue'
import { ReservationStatus } from '#shared/types/models/reservations/enums'
import type { PickupTypeEnum } from '#shared/types/models/reservations/enums'
import { TomLocationToPlace } from '#shared/types/models/location/search/tomLocation'
import { useReservations } from '~/composables/database/reservations/useReservations'

import DateTimePickup from '~/components/pages/reservation/DateTimePickup.vue'
import ContactData from '~/components/pages/reservation/ContactData.vue'
import ReservationSummary from '~/components/pages/reservation/ReservationSummary.vue'
import ManualReservationAddress from '~/components/pages/reservation/ManualReservationAddress.vue'
import Map from '~/components/shared/Map/Map.vue'
import ContinueButton from '~/components/shared/buttons/ContinueButton.vue'
import SummaryButton from '~/components/shared/buttons/SummaryButton.vue'
import ReservationButton from '~/components/shared/buttons/ReservationButton.vue'
import ReservationCodeBadge from '~/components/shared/ReservationCode/ReservationCodeBadge.vue'
import { DEFAULT_COUNTRY_CODE, type CountryCode } from '~/utils/ui/countryCodes'
import { useReverseGeocoding } from '~/composables/geolocation/useReverseGeocoding'
import { useUserPosition } from '~/composables/geolocation/useUserPosition'
import type { LocationType } from '~/types/location/locationType'


export type ManualModeSelectionType = 'manual' | 'user-location'


const mapRef = ref<InstanceType<typeof Map> | null>(null)


definePageMeta({ layout: 'reservation' })

const { createReservation } = useReservations()

const RESERVATION_INTERNAL_ERROR_TITLE = 'Nie udało się wykonać rezerwacji'
const RESERVATION_INTERNAL_ERROR_DESCRIPTION =
  'Wystąpił wewnętrzny błąd aplikacji, prosimy skontaktuj się z nami.'

const mainContentRef = ref<HTMLElement | null>(null)

// Step 1
const pickupLocation = ref<TomLocation | undefined>()
const destination = ref<TomLocation | undefined>()
const distance = ref<number | undefined>()

const manualMode = ref(false)
const manualModeLocationType = ref<LocationType>("pickup")
const manualModeSelectionType = ref<ManualModeSelectionType>("manual")
const showManualReservationAddress = ref(false)
const showManualReservationAddressTimeout = ref<NodeJS.Timeout | undefined>(undefined)
const manualLocationTimeout = ref<NodeJS.Timeout | undefined>(undefined)
const fetchingReverseGeocoding = ref(false)
const reverseGeocodingResult = ref<TomLocation | undefined>()
const showGetUserPositionButton = ref(true)
const currentLat = ref<number | undefined>()
const currentLon = ref<number | undefined>()
const userLocationPermissionsDenied = ref(false)

// Step 2
const rideDateDraft = ref('')
const rideTimeDraft = ref('')
const pickupType = ref<PickupTypeEnum | null>(null)
const pickupAt = ref<DateTime | undefined>()

// Step 3
const firstName = ref('')
const lastName = ref('')
const selectedCountry = ref<CountryCode>(DEFAULT_COUNTRY_CODE)
const phoneNumberDraft = ref('')
const finalPhoneNumber = ref('')

const step = ref(1)
const showSuccess = ref(false)
const isReservationSubmitting = ref(false)

const reservationCode = ref<string | undefined>()
const isInputHidden = ref(false)

/**
 * Builds a reservation from current wizard state and validates it against reservationSchema.
 */
function buildReservationFromWizardState(): Result<Reservation> {
    const pickup = pickupLocation.value
    const dest = destination.value
    const type = pickupType.value

    if (!pickup || !dest || type == null || !distance.value) {
        console.error('[buildReservationFromWizardState] Missing required wizard fields')
        return { success: false, error: 'Missing required wizard fields' }
    }

    if (!pickupAt.value) {
        console.error('[buildReservationFromWizardState] Invalid pickupAt')
        return { success: false, error: 'Invalid pickupAt' }
    }

    const normalizedPhone = finalPhoneNumber.value.replace(/\s/g, '')

    const candidate: Reservation = {
        pickup: TomLocationToPlace(pickup),
        destination: TomLocationToPlace(dest),
        distance: distance.value,
        pickupAt: pickupAt.value,
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


watch(pickupLocation, async (newVal) => {
    if (!newVal) return
    if (!mapRef.value) {
        console.error('[pickupLocation] Map not initialized')
        errorNotification('Wystąpił problem podczas ładowania mapy')
        return
    }

    if (pickupLocation.value && destination.value) {
        const result = await mapRef.value.getRoute(pickupLocation.value.position, destination.value.position)
        if (!result.success) {
            console.error('[pickupLocation] Failed to get route:', result.error)
            errorNotification('Wystąpił problem podczas tworzenia trasy')
            return
        }
        mapRef.value?.getRoute(pickupLocation.value.position, destination.value.position)
    }
    mapRef.value?.flyTo(newVal.position.lat, newVal.position.lon, 'pickup')
})


watch(destination, async (newVal) => {
    if (!newVal) return
    if (!mapRef.value) {
        console.error('[destination] Map not initialized')
        errorNotification('Wystąpił problem podczas ładowania mapy')
        return
    }

    if (pickupLocation.value && destination.value) {
        const result = await mapRef.value.getRoute(pickupLocation.value.position, destination.value.position)
        if (!result.success) {
            console.error('[destination] Failed to get route:', result.error)
            errorNotification('Wystąpił problem podczas tworzenia trasy')
            return
        }
        distance.value = result.data.distance
    }
    mapRef.value?.flyTo(newVal.position.lat, newVal.position.lon, 'destination')
})


watch([manualMode, currentLat, currentLon], async () => {
    if (!manualMode.value || !currentLat.value || !currentLon.value) return
    if (manualLocationTimeout.value) clearTimeout(manualLocationTimeout.value)
    if (showManualReservationAddressTimeout.value) clearTimeout(showManualReservationAddressTimeout.value)

    showManualReservationAddress.value = false
    fetchingReverseGeocoding.value = true
    
    manualLocationTimeout.value = setTimeout(() => {
        findManualLocation(currentLat.value!, currentLon.value!)
    }, 1500)

    showManualReservationAddressTimeout.value = setTimeout(() => {
        showManualReservationAddress.value = true
    }, 300)
})


async function findManualLocation(lat: number, lon: number): Promise<void> {
    const result = await useReverseGeocoding().callReverseGeocoding(lat, lon)
    fetchingReverseGeocoding.value = false

    // Outdated
    if (currentLat.value !== lat || currentLon.value !== lon) return

    if (!result.success) {
        errorNotification('Wystąpił problem podczas pobierania lokalizacji')
        console.error('[manualMode] Failed to get reverse geocoding:', result.error)
        return
    }
    
    if (result.data === null) return

    reverseGeocodingResult.value = result.data
}


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


const isStep2Valid = ref<boolean>(false)
const isStep3Valid = ref<boolean>(false)

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
        if (!isStep2Valid.value) {
            infoNotification('Popraw błędy w formularzu', 'Uzupełnij wymagane pola')
            return
        }
        step.value = 3
    }
    else if (step.value === 3) {
        if (!isStep3Valid.value) {
            infoNotification('Popraw błędy w formularzu', 'Uzupełnij wymagane pola')
            return
        }
        step.value = 4
        steps4Visited.value = true
    }
}


function handleToggleManualMode(manualModeData: { selectionType: 'user-location' } | { selectionType: 'manual', locationType: LocationType }) {
    manualModeSelectionType.value = manualModeData.selectionType
    if (manualModeData.selectionType === 'manual') {
        manualModeLocationType.value = manualModeData.locationType
    }
    manualMode.value = true
    showGetUserPositionButton.value = false
    mapRef.value?.useManualMode().enableManualMode()
}


function handlePickupLocationSelected(location: TomLocation) {
    pickupLocation.value = location
}


function handleDestinationSelected(location: TomLocation) {
    destination.value = location
}


function handlePickupAtUpdated(newPickupAt: string): void {
    const parsedPickupAt = dateTimeSchema.safeParse(newPickupAt)
    if (!parsedPickupAt.success) {
        console.error('[handlePickupAtUpdated] Invalid pickupAt')
        return
    }
    pickupAt.value = parsedPickupAt.data
}


async function handleLocateUserPosition() {
    if (userLocationPermissionsDenied.value) {
        warningNotification('Nieudzielono dostępu do lokalizacji', 'Opcje pobierania lokalizacji są niedostępne. Aby to zmnienić odśwież stronę i udziel ich ponownie.')
        return
    }

    const result = await useUserPosition().getUserPosition()

    if (result.success) {
        handleToggleManualMode({ selectionType: 'user-location' })
        currentLat.value = result.data.lat
        currentLon.value = result.data.lon
        mapRef.value?.flyTo(result.data.lat, result.data.lon, null)
        showManualReservationAddress.value = true
        findManualLocation(result.data.lat, result.data.lon)
    } else {
        switch (result.errorType) {
        case "PERMISSION_DENIED":
            userLocationPermissionsDenied.value = true
            return
        case "POSITION_UNAVAILABLE":
            errorNotification('Wystąpił problem podczas pobierania lokalizacji')
            return
        case "TIMEOUT":
            errorNotification('Wystąpił problem podczas pobierania lokalizacji')
            return
        case "UNKNOWN_ERROR":
            errorNotification('Wystąpił problem podczas pobierania lokalizacji')
            return
        }
    }
}

/**
 * Prevent user zoom on mobile devices, after map is loaded, but other element is focused.
 */
function preventZoomOnMobile() {
    mainContentRef.value?.blur();
}


function handleManualModeDisable() {
    manualMode.value = false
    mapRef.value?.useManualMode().disableManualMode()
    showGetUserPositionButton.value = true
    reverseGeocodingResult.value = undefined
    manualModeSelectionType.value = 'manual'
}


function handleManualModeConfirmation(locationType: LocationType | null) {
    if (!reverseGeocodingResult.value || !mapRef.value) return

    if (locationType) {
        manualModeLocationType.value = locationType
    }
  
    if (manualModeLocationType.value === 'pickup') {
        pickupLocation.value = reverseGeocodingResult.value
        mapRef.value?.flyTo(pickupLocation.value.position.lat, pickupLocation.value.position.lon, 'pickup')
    } else if (manualModeLocationType.value === 'destination') {
        destination.value = reverseGeocodingResult.value
        mapRef.value?.flyTo(destination.value.position.lat, destination.value.position.lon, 'destination')
    } else {
        errorNotification('Wystąpił błąd wewnętrzny aplikacji. Spróbuj ponownie później.')
        console.error('[handleManualModeConfirmation] Invalid location type:', locationType)
    }

    handleManualModeDisable()
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
    reservationCode.value = result.data.reservation.code
}
</script>

<template>
  <div
    ref="mainContentRef"
    class="relative h-[calc(100vh-3.55rem)] overflow-auto"
    :class="step === 1 && !mapRef?.loaded ? 'touch-none!' : ''"
  >
    <div
      class="absolute inset-0 z-0 transition-all duration-500"
      :class="step !== 1 ? 'blur-sm pointer-events-none brightness-75' : ''"
    >
      <Map
        ref="mapRef"
        v-model:current-lat="currentLat"
        v-model:current-lon="currentLon"
        :user-location-permissions-denied="userLocationPermissionsDenied"
        :place-location-button-high="isStep1Valid"
        :show-get-user-position-button="showGetUserPositionButton"
        :manual-mode="manualMode"
        @on-loaded="preventZoomOnMobile"
        @on-user-position-updated="handleLocateUserPosition"
      />
    </div>
    <UButton
      v-if="step === 1 && isInputHidden"
      color="neutral"
      variant="ghost"
      class="absolute top-5 right-5 z-10 rounded-full bg-gray-100 dark:bg-dark-700 pl-1.5 pr-4 py-1.5 opacity-100 hover:opacity-90 hover:bg-gray-200 dark:hover:bg-dark-600 active:scale-[0.98] group"
      @click="() => { isInputHidden = !isInputHidden }"
    >
      <template #leading>
        <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-dark-500 group-hover:bg-gray-400 dark:group-hover:bg-dark-400 transition-colors duration-200">
          <UIcon name="i-lucide-eye" class="size-4 text-white transition-transform duration-200 ease-out group-hover:-translate-y-0.5" />
        </span>
      </template>
      <span
        class="text-sm font-semibold text-gray-500 dark:text-gray-400"
      >
        Pokaż trasę
      </span>
    </UButton>
    <div 
      class="flex flex-col max-w-[1200px] mx-auto px-5 relative z-10 h-max"
      :class="step !== 1 ? 'h-full' : isInputHidden ? 'pointer-events-none opacity-0' : ''"
    >
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
              <div class="flex flex-col items-center text-center gap-5">
                <div class="success-checkmark">
                  <div class="success-checkmark-circle size-24 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-green-600 shadow-[0_20px_40px_-12px_rgb(22_163_74/0.4)]">
                    <UIcon name="i-lucide-check" class="size-14 text-white" />
                  </div>
                </div>
                <h1 class="success-title text-2xl font-bold text-gray-900 dark:text-white">
                  Gotowe! <br> Przejazd zarezerwowany
                </h1>
                <p class="success-desc font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  Teraz możesz odetchnąć,<br>my zajmiemy się resztą.
                </p>
                <div v-if="reservationCode" class="success-desc w-full bg-white dark:bg-dark-900/50 p-4 rounded-2xl">
                  <p class="text-xs font-medium text-gray-600 dark:text-gray-500 text-left">
                    Twój numer rezerwacji:
                  </p>
                  <ReservationCodeBadge :code="reservationCode ?? ''" />
                </div>
                <p class="success-desc text-right w-full tracking-tight text-gray-500 dark:text-gray-400">
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
          <!-- Phase 1: Place -->
          <div v-if="step === 1" key="phase1" class="pt-4">
            <section class="text-center">
              <div 
                v-if="!manualMode"
                class="rounded-2xl bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 shadow-sm">
                <LocationSearchInput
                  v-model:from-model-value="pickupLocation"
                  v-model:to-model-value="destination"
                  :distance="distance"
                  from-label="Miejsce odbioru"
                  to-label="Cel podróży"
                  placeholder="Wpisz lub wybierz lokalizację..."
                  to-placeholder="Dokąd jedziesz?"
                  to-icon="i-lucide-navigation"
                  :is-input-hidden="isInputHidden"
                  @from-location-selected="handlePickupLocationSelected"
                  @to-location-selected="handleDestinationSelected"
                  @toggle-input-visibility="isInputHidden = !isInputHidden"
                  @toggle-manual-mode="handleToggleManualMode"
                />
              </div>
              <UButton
                v-else
                color="neutral"
                variant="ghost"
                class="absolute top-0 right-0 rounded-full bg-gray-100 dark:bg-dark-700 mt-8 pl-1.5 pr-1.5 [@media(min-height:700px)]:pr-4 py-1.5 opacity-80 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-dark-600 active:scale-[0.98] group"
                @click="handleManualModeDisable"
              >
                <template #leading>
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-dark-500 group-hover:bg-gray-400 dark:group-hover:bg-dark-400 transition-colors duration-200">
                    <UIcon name="i-lucide-eye" class="size-4 text-white" />
                  </span>
                </template>
                <span
                  class="hidden [@media(min-height:700px)]:inline text-sm font-semibold text-gray-500 dark:text-gray-400"
                >
                  {{ manualMode ? 'Automatyczny tryb' : 'Tryb manualny' }}
                </span>
              </UButton>
            </section>
          </div>

          <div v-else class="h-full mt-4 [@media(min-height:700px)]:mt-18">
            <DateTimePickup
              v-if="step === 2"
              key="phase2"
              v-model:ride-date="rideDateDraft"
              v-model:ride-time="rideTimeDraft"
              v-model:is-step-valid="isStep2Valid"
              v-model:pickup-type="pickupType"
              custom-class="w-[calc(min(100%,700px))]"
              @go-to-summary="goToStep(4)"
              @pickup-at-updated="handlePickupAtUpdated"
            />
              
            <ContactData
              v-if="step === 3"
              key="phase3"
              v-model:is-step-valid="isStep3Valid"
              v-model:first-name="firstName"
              v-model:last-name="lastName"
              v-model:phone-number="phoneNumberDraft"
              v-model:selected-country="selectedCountry"
              v-model:final-phone-number="finalPhoneNumber"
              custom-class="w-[calc(min(100%,700px))]"
              @go-to-summary="goToStep(4)"
            />

            <ReservationSummary
              v-if="step === 4 && pickupAt"
              key="phase4"
              :pickup-location="pickupLocation"
              :destination="destination"
              :pickup-at="pickupAt"
              :pickup-type="pickupType"
              :first-name="firstName"
              :last-name="lastName"
              :phone-number="finalPhoneNumber"
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
                @click="submitReservation"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="step === 1"
      class="w-full max-w-md px-5 fixed bottom-20 left-1/2 -translate-x-1/2 z-20 flex justify-center items-center gap-5"
    >
      <ContinueButton v-if="pickupLocation && destination && !manualMode" text="Dalej" @click="validateAndAdvance" />
      <ManualReservationAddress
        v-if="manualMode && (fetchingReverseGeocoding || reverseGeocodingResult) && showManualReservationAddress"
        :loading="fetchingReverseGeocoding"
        :address="reverseGeocodingResult"
        :is-pickup-selected="!!pickupLocation"
        :is-destination-selected="!!destination"
        :mode="manualModeSelectionType"
        @continue="handleManualModeConfirmation"
      />
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
