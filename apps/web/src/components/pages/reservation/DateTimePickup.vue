<script lang="ts">
import { z } from 'zod'
import { PickupTypeEnum } from '#shared/types/reservations/enums'
import { pickupTypeOptions } from '~/utils/ui/reservations'


type PickupTypeValue = (typeof pickupTypeOptions)[number]['value']


/**
 * Parses an HTML `input[type="date"]` value (`YYYY-MM-DD`) into a local calendar date.
 */
export function parseHtmlDateToLocalDate(isoDate: string): Date | null {
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
 * Returns local midnight for the given instant’s calendar day (same interpretation as HTML date inputs).
 */
function startOfLocalCalendarDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}


/**
 * Combines a local calendar date (from `type="date"`) with an ISO time string (`type="time"`, np. `14:30`).
 */
function buildLocalPickupAt(rideDate: Date, rideTime: string): Date {
    const parts = rideTime.trim().split(':').map((x) => Number(x))
    const hours = parts[0] ?? 0
    const minutes = parts[1] ?? 0
    const seconds = parts[2] ?? 0
    return new Date(
        rideDate.getFullYear(),
        rideDate.getMonth(),
        rideDate.getDate(),
        hours,
        minutes,
        seconds,
        0,
    )
}


/**
 * `UInput` `type="date"` supplies `YYYY-MM-DD` strings; we parse to the same local {@link Date} used for {@link reservationSchema} `pickupDate`.
 */
const phase2RideDateSchema = z
    .string()
    .trim()
    .min(1, 'Wybierz datę przejazdu')
    .refine((s) => parseHtmlDateToLocalDate(s) !== null, { message: 'Wybierz datę przejazdu' })
    .transform((s) => parseHtmlDateToLocalDate(s)!)


export const phase2Schema = z.object({
    rideDate: phase2RideDateSchema,
    rideTime: z.iso.time().min(1, 'Wybierz godzinę przejazdu'),
    pickupType: z.enum(PickupTypeEnum),
}).superRefine((data, ctx) => {
    const pickupAt = buildLocalPickupAt(data.rideDate, data.rideTime)
    const now = new Date()
    if (pickupAt.getTime() >= now.getTime()) {
        return
    }

    const todayStart = startOfLocalCalendarDay(now)
    const selectedStart = startOfLocalCalendarDay(data.rideDate)
    if (selectedStart.getTime() < todayStart.getTime()) {
        ctx.addIssue({
            code: "custom",
            message: 'Data nie może być z przeszłości.',
            path: ['rideDate'],
        })
    }
    else if (selectedStart.getTime() === todayStart.getTime()) {
        ctx.addIssue({
            code: "custom",
            message: 'Godzina nie może być w przeszłości.',
            path: ['rideTime'],
        })
    }
    else {
        ctx.addIssue({
            code: "custom",
            message: 'Wybrany termin już minął.',
            path: ['rideDate'],
        })
    }
})
</script>

<script setup lang="ts">
const rideDate = defineModel<string>('rideDate', { required: true })
const rideTime = defineModel<string>('rideTime', { required: true })
const pickupType = defineModel<PickupTypeValue | null>('pickupType', { required: true })


defineProps<{
    customClass?: string
}>()


defineEmits<{
    goToSummary: []
}>()


function parse2Step() {
    return phase2Schema.safeParse({
        rideDate: rideDate.value,
        rideTime: rideTime.value,
        pickupType: pickupType.value,
    })
}


const phase2Parse = computed(() => parse2Step())


const showDateError = computed(() => {
    if (!rideDate.value) {
        return false
    }
    if (phase2Parse.value.success) {
        return false
    }
    return phase2Parse.value.error.issues.some((issue) => issue.path[0] === 'rideDate')
})


const showTimeError = computed(() => {
    if (!rideTime.value) {
        return false
    }
    if (phase2Parse.value.success) {
        return false
    }
    return phase2Parse.value.error.issues.some((issue) => issue.path[0] === 'rideTime')
})


/**
 * Returns the first Zod error message for a phase-2 field (inline text under the input).
 */
function phase2FieldMessage(pathKey: 'rideDate' | 'rideTime'): string {
    if (pathKey === 'rideDate' && !rideDate.value) {
        return ''
    }
    if (pathKey === 'rideTime' && !rideTime.value) {
        return ''
    }
    const parsed = phase2Parse.value
    if (parsed.success) {
        return ''
    }
    return parsed.error.issues.find((issue) => issue.path[0] === pathKey)?.message ?? ''
}
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
            />
            <p
              v-show="showDateError"
              class="text-left text-xs text-error mt-1.5"
            >
              {{ phase2FieldMessage('rideDate') }}
            </p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Godzina</label>
            <UInput
              v-model="rideTime"
              type="time"
              icon="i-lucide-clock"
              class="w-full"
              :color="showTimeError ? 'error' : 'primary'"
              :highlight="showTimeError"
            />
            <p
              v-show="showTimeError"
              class="text-left text-xs text-error mt-1.5"
            >
              {{ phase2FieldMessage('rideTime') }}
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

