<script setup lang="ts">
import type { Driver } from '#shared/types/drivers/schema'
import { driverSchema } from '#shared/types/drivers/schema'
import ModalBase from '~/components/Modal/Base.vue'
import { useDrivers } from '~/composables/database/useDrivers'
import { errorNotification, successfulNotification } from '~/utils/notifications/toast'


const props = defineProps<{
    driver: Driver | null
}>()

const open = defineModel<boolean>('open', { required: true })

const { createDriver, updateDriver } = useDrivers()

const name = ref('')
const phoneNumber = ref('')
const pending = ref(false)

const formSchema = driverSchema.pick({ name: true, phoneNumber: true })

const title = computed(() => (props.driver?.id ? 'Edytuj kierowcę' : 'Nowy kierowca'))


watch(
    () => [open.value, props.driver] as const,
    ([isOpen, driver]) => {
        if (!isOpen) {
            return
        }
        if (driver?.id) {
            name.value = driver.name
            phoneNumber.value = driver.phoneNumber
        } else {
            name.value = ''
            phoneNumber.value = ''
        }
    },
)


async function submit(close: () => void): Promise<void> {
    const parsed = formSchema.safeParse({
        name: name.value.trim(),
        phoneNumber: phoneNumber.value.trim(),
    })

    if (!parsed.success) {
        console.error(parsed.error.issues)
        errorNotification('Formularz', parsed.error.issues[0]?.message ?? 'Nieprawidłowe dane')
        return
    }

    pending.value = true
    const payload = parsed.data

    if (props.driver?.id) {
        const result = await updateDriver(props.driver.id, {
            name: payload.name,
            phoneNumber: payload.phoneNumber,
        })
        pending.value = false

        if (!result.success) {
            console.error(result.error)
            errorNotification('Błąd', result.error)
            return
        }
    } else {
        const result = await createDriver({
            name: payload.name,
            phoneNumber: payload.phoneNumber,
        })
        pending.value = false

        if (!result.success) {
            console.error(result.error)
            errorNotification('Błąd', result.error)
            return
        }
    }

    successfulNotification('Zapisano kierowcę')
    close()
    open.value = false
}
</script>

<template>
  <ModalBase
    v-model:open="open"
    :title="title"
    description="Uzupełnij dane kierowcy."
    class="max-w-md"
  >
    <div class="space-y-4">
      <UFormField label="Nazwa" name="name" required>
        <UInput
          v-model="name"
          autocomplete="name"
          placeholder="Jan Kowalski"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Telefon" name="phoneNumber" required>
        <UInput
          v-model="phoneNumber"
          type="tel"
          autocomplete="tel"
          placeholder="+48 123 456 789"
          class="w-full"
        />
      </UFormField>
    </div>

    <template #footer="{ close }">
      <UButton
        variant="ghost"
        color="neutral"
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
        Zapisz
      </UButton>
    </template>
  </ModalBase>
</template>
