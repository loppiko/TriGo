<script lang="ts">
import { z } from 'zod'
import { PickupTypeEnum } from '#shared/types/models/reservations/enums'
import { pickupTypeOptions } from '~/utils/ui/reservations'
import type { Result } from '#shared/types/core'
import { dateTimeSchema, type DateTime } from '#shared/types/models/reservations/schema'


type PickupTypeValue = (typeof pickupTypeOptions)[number]['value']


const dateErrorMessage: string = "Data nie może być z przeszłości."


/**
 * Builds an ISO datetime string from HTML date and time input values.
 */
export function buildPickupAtIso(rideDate: string, rideTime: string): Result<DateTime> {
    const trimmedDate = rideDate.trim()
    const trimmedTime = rideTime.trim()

    if (!trimmedDate && !trimmedTime) {
        return { success: false, error: 'Invalid ride date and time' }
    }

    const date = z.iso.date().safeParse(trimmedDate)
    if (!date.success) {
        return { success: false, error: 'Invalid ride date' }
    }

    const timeParse = z.iso.time().safeParse(trimmedTime)
    if (!timeParse.success) {
        return { success: false, error: 'Invalid ride time' }
    }

    const datetime = dateTimeSchema.safeParse(new Date(`${date.data}T${timeParse.data}`).toISOString())
    if (!datetime.success) {
        return { success: false, error: 'Invalid datetime' }
    }

    return { success: true, data: datetime.data }
}


export const phase2Schema = z.object({
    pickupAt: z.iso.datetime({ message: 'Wybierz datę i godzinę przejazdu' }),
    pickupType: z.enum(PickupTypeEnum),
}).superRefine((data, ctx) => {
    const pickupAt = new Date(data.pickupAt)
    const now = new Date()

    if (pickupAt.getTime() > now.getTime()) {
        return
    } else {
        ctx.addIssue({
            code: "custom",
            message: dateErrorMessage,
            path: ['pickupAt'],
        })
    }
})
</script>

<script setup lang="ts">
const rideDate = defineModel<string>('rideDate', { required: true })
const rideTime = defineModel<string>('rideTime', { required: true })
const pickupType = defineModel<PickupTypeValue | null>('pickupType', { required: true })
const isStepValid = defineModel<boolean>('isStepValid', { required: true })

const dateTouched = ref(false)
const timeTouched = ref(false)

defineProps<{
    customClass?: string
}>()


const emit = defineEmits<{
    goToSummary: []
    pickupAtUpdated: [string]
}>()


onMounted(() => {
    if (rideDate.value && rideTime.value) {
        dateTouched.value = true
        timeTouched.value = true
    }
})


function parse2Step() {
    const pickupAtResult = buildPickupAtIso(rideDate.value, rideTime.value)
    
    const parsedResult = phase2Schema.safeParse({
        pickupAt: pickupAtResult.success ? pickupAtResult.data : '',
        pickupType: pickupType.value,
    })

    if (pickupAtResult.success) {
        emit('pickupAtUpdated', pickupAtResult.data)
    }

    isStepValid.value = parsedResult.success
    return parsedResult
}


const phase2Parse = computed(() => parse2Step())


const showDateError = computed(() => {
    if (phase2Parse.value.success) {
        return false
    }
    if (dateTouched.value && timeTouched.value && !phase2Parse.value.success) {
        return true
    }
    return false
})
</script>

<template>
  <div class="py-4 mx-auto" :class="customClass ?? ''">
    <section class="text-center">
      <div class="flex flex-col items-center mb-4">
        <div class="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25 ring-4 ring-primary/10">
          2
        </div>
        <p class="mt-2.5 text-sm font-semibold text-gray-200 dark:text-gray-200">
          Kiedy i jak?
        </p>
      </div>
      <div class="rounded-2xl bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-gray-100 dark:border-dark-700 p-5 space-y-5 shadow-sm">
        <div class="flex flex-col gap-3">
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Data</label>
            <UInput
              v-model="rideDate"
              type="date"
              icon="i-lucide-calendar"
              class="w-full"
              :color="showDateError ? 'error' : 'primary'"
              :highlight="showDateError"
              @blur="dateTouched = true"
            />
            <p
              v-show="showDateError"
              class="text-left text-xs text-error mt-1.5"
            >
              {{ dateErrorMessage }}
            </p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Godzina</label>
            <UInput
              v-model="rideTime"
              type="time"
              icon="i-lucide-clock"
              class="w-full"
              :color="showDateError ? 'error' : 'primary'"
              :highlight="showDateError"
              @blur="timeTouched = true"
            />
            <p
              v-show="showDateError"
              class="text-left text-xs text-error mt-1.5"
            >
              {{ dateErrorMessage }}
            </p>
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
                ? 'border-primary bg-white dark:bg-dark-800 shadow-sm shadow-primary/10'
                : 'border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'"
              type="button"
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
    </section>
  </div>
</template>

<style scoped>
.check-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.check-enter-from {
  opacity: 0;
  transform: scale(0);
}
</style>

