<script setup lang="ts">
import type { Driver } from '#shared/types/drivers/schema'
import type { Place } from '#shared/types/location/schema'
import type { TomLocation } from '#shared/types/location/search/schema'
import {
    reservationDestinationLocationToTomLocation,
    reservationPickupLocationToTomLocation,
    TomLocationToPlace,
} from '#shared/types/location/search/tomLocation'
import type { Reservation } from '#shared/types/reservations/schema'
import { ReservationStatus } from '#shared/types/reservations/enums'
import AssignDriverModal from '~/components/Reservations/AssignDriverModal.vue'
import LocationSearchInput from '~/components/LocationSearchInput/LocationSearchInput.vue'
import ModalBase from '~/components/Modal/Base.vue'
import { useReservations } from '~/composables/database/useReservations'
import { createEmptyReservationForm, reservationFormToReservation, reservationToReservationForm } from '~/types/reservations/reservationForm'
import { errorNotification, infoNotification, successfulNotification } from '~/utils/notifications/toast'
import { pickupTypeOptions, statusOptions } from '~/utils/ui/reservations'
import { reservationFormSchema, type ReservationForm } from '~/types/reservations/formSchema'


const props = defineProps<{
    reservation: Reservation | null
}>()

const open = defineModel<boolean>('open', { required: true })

const { createReservation, updateReservation } = useReservations()

const pending = ref(false)
const isEdit = computed(() => !!props.reservation?.id)
const title = computed(() => isEdit.value ? 'Edytuj rezerwację' : 'Nowa rezerwacja')

const selectedPickup = ref<TomLocation | undefined>(props.reservation ? reservationPickupLocationToTomLocation(props.reservation) : undefined)
const selectedDestination = ref<TomLocation | undefined>(props.reservation ? reservationDestinationLocationToTomLocation(props.reservation) : undefined)

/**
 * Reactive form state initialised from the shared empty-form factory.
 * `pickupLocation` / `destination` are managed separately via `selectedPickup` /
 * `selectedDestination` and injected at submit time.
 */
const form = ref<ReservationForm>((props.reservation) ? reservationToReservationForm(props.reservation) : createEmptyReservationForm())

const assignDriverModalOpen = ref(false)


/**
 * Writes the chosen driver into the form and advances status to ASSIGNED.
 */
function handleDriverAssigned(driver: Driver): void {
    form.value.assignedDriver = {
        id: driver.id ?? '',
        name: driver.name,
        phoneNumber: driver.phoneNumber,
    }
    form.value.status = ReservationStatus.ASSIGNED
}


/**
 * Clears driver assignment and resets status to waiting for a driver.
 */
function clearAssignedDriver(): void {
    form.value.assignedDriver = undefined
    form.value.status = ReservationStatus.WAITING_FOR_ASSIGNMENT
}


watch(
    () => [open.value, props.reservation] as const,
    ([isOpen, res]) => {
        if (!isOpen) {
            return
        }

        if (res) {
            form.value = reservationToReservationForm(res)
            selectedPickup.value = reservationPickupLocationToTomLocation(res)
            selectedDestination.value = reservationDestinationLocationToTomLocation(res)
            return
        }

        form.value = createEmptyReservationForm()
        selectedPickup.value = undefined
        selectedDestination.value = undefined
    },
)


function handlePickupSelected(loc: TomLocation): void {
    selectedPickup.value = loc
}


function handleDestinationSelected(loc: TomLocation): void {
    selectedDestination.value = loc
}


function handleDistanceUpdated(dist: number): void {
    form.value.distance = dist
    if (selectedDestination.value) {
        selectedDestination.value.dist = dist
    }
}


const resolvedPickup = computed<Place | null>(() =>
    selectedPickup.value ? TomLocationToPlace(selectedPickup.value) : null,
)

const resolvedDestination = computed<Place | null>(() =>
    selectedDestination.value ? TomLocationToPlace(selectedDestination.value) : null,
)

const resolvedDistance = computed<number>(() =>
    selectedDestination.value?.dist ?? props.reservation?.distance ?? 0,
)


async function submit(close: () => void): Promise<void> {
    const [year, month, day] = (form.value.pickupDateStr || '').split('-').map(Number)
    const pickupDate = year != null && month != null && day != null
        ? new Date(year, month - 1, day)
        : undefined

    const normalizedTime = form.value.pickupTimeStr?.length === 5 ? `${form.value.pickupTimeStr}:00` : form.value.pickupTimeStr

    form.value.pickupLocation = resolvedPickup.value ?? undefined
    form.value.destination = resolvedDestination.value ?? undefined
    form.value.distance = resolvedDistance.value
    form.value.pickupDate = pickupDate
    form.value.pickupTime = normalizedTime

    const formParseResult = reservationFormSchema.safeParse(form.value)

    if (!formParseResult.success) {
        const lastIssue = formParseResult.error.issues[formParseResult.error.issues.length - 1]
        infoNotification('Popraw błędy w formularzu', lastIssue?.message ?? 'Nieprawidłowe dane')
        return
    }

    const parseResult = reservationFormToReservation(formParseResult.data)
    if (!parseResult.success) {
        console.error('[ReservationModal] Conversion failed', parseResult.error)
        errorNotification('Błąd konwersji', parseResult.error)
        return
    }

    pending.value = true

    if (isEdit.value && props.reservation?.id) {
        const result = await updateReservation(props.reservation.id, parseResult.data)
        pending.value = false

        if (!result.success) {
            console.error('[ReservationModal] Update failed', result.error)
            errorNotification('Błąd zapisu', result.error)
            return
        }

        successfulNotification('Zapisano zmiany')
    } else {
        const result = await createReservation(parseResult.data)
        pending.value = false

        if (!result.success) {
            console.error('[ReservationModal] Create failed', result.error)
            errorNotification('Błąd zapisu', result.error)
            return
        }

        successfulNotification('Rezerwacja utworzona')
    }

    close()
    open.value = false
}
</script>

<template>
  <ModalBase
    v-model:open="open"
    :title="title"
    description="Uzupełnij wszystkie wymagane pola."
    class="max-w-2xl"
    :dismissible="!pending"
  >
    <div class="space-y-6">
      <fieldset class="space-y-3">
        <legend class="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Trasa
        </legend>

        <LocationSearchInput
          v-model:from-model-value="selectedPickup"
          v-model:to-model-value="selectedDestination"
          from-label="Miejsce odbioru"
          to-label="Cel podróży"
          placeholder="Wpisz lub wybierz lokalizację..."
          to-placeholder="Dokąd jedziesz?"
          icon="i-lucide-map-pin"
          to-icon="i-lucide-navigation"
          @from-location-selected="handlePickupSelected"
          @to-location-selected="handleDestinationSelected"
          @distance-updated="handleDistanceUpdated"
        />
      </fieldset>

      <div class="border-t border-gray-100" />

      <fieldset class="space-y-3">
        <legend class="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Termin i typ przejazdu
        </legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField label="Data odbioru" name="pickupDate" required>
            <UInput
              v-model="form.pickupDateStr"
              type="date"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Godzina odbioru" name="pickupTime" required>
            <UInput
              v-model="form.pickupTimeStr"
              type="time"
              class="w-full"
            />
          </UFormField>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField label="Typ odbioru" name="pickupType">
            <USelect
              v-model="form.pickupType"
              :items="pickupTypeOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>
          <UFormField v-if="isEdit" label="Status" name="status">
            <USelect
              v-model="form.status"
              :items="statusOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>
        </div>
      </fieldset>

      <div class="border-t border-gray-100" />

      <fieldset class="space-y-3">
        <legend class="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Kierowca
        </legend>

        <div
          v-if="form.assignedDriver"
          class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-dark-600 dark:bg-dark-800/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Przypisany kierowca
            </p>
            <p class="mt-1 truncate text-sm font-semibold text-highlighted">
              {{ form.assignedDriver.name }}
            </p>
            <p class="truncate text-xs text-muted">
              {{ form.assignedDriver.phoneNumber }}
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            <UButton
              size="sm"
              variant="soft"
              color="primary"
              icon="i-heroicons-arrow-path"
              @click="assignDriverModalOpen = true"
            >
              Zmień
            </UButton>
            <UButton
              size="sm"
              variant="ghost"
              color="neutral"
              icon="i-heroicons-x-mark"
              @click="clearAssignedDriver"
            >
              Usuń przypisanie
            </UButton>
          </div>
        </div>

        <div v-else class="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center dark:border-dark-600">
          <p class="mb-3 text-sm text-muted">
            Brak przypisanego kierowcy — możesz wybrać go teraz lub później.
          </p>
          <UButton
            color="primary"
            variant="soft"
            icon="i-heroicons-user-plus"
            @click="assignDriverModalOpen = true"
          >
            Wybierz kierowcę
          </UButton>
        </div>
      </fieldset>

      <div class="border-t border-gray-100" />

      <fieldset class="space-y-3">
        <legend class="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Dane klienta
        </legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField label="Imię" name="firstName" required>
            <UInput
              v-model="form.clientDetails.firstName"
              placeholder="Jan"
              autocomplete="given-name"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Nazwisko" name="lastName" required>
            <UInput
              v-model="form.clientDetails.lastName"
              placeholder="Kowalski"
              autocomplete="family-name"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="Telefon" name="phoneNumber" required>
          <UInput
            v-model="form.clientDetails.phoneNumber"
            type="tel"
            placeholder="+48 123 456 789"
            autocomplete="tel"
            class="w-full"
          />
        </UFormField>
      </fieldset>
    </div>

    <template #footer="{ close }">
      <UButton
        variant="ghost"
        color="neutral"
        :disabled="pending"
        @click="close"
      >
        Anuluj
      </UButton>
      <UButton
        color="primary"
        :loading="pending"
        :disabled="pending"
        @click="submit(close)"
      >
        {{ isEdit ? 'Zapisz zmiany' : 'Utwórz rezerwację' }}
      </UButton>
    </template>
  </ModalBase>

  <AssignDriverModal
    v-model:open="assignDriverModalOpen"
    @confirm="handleDriverAssigned"
  />
</template>
