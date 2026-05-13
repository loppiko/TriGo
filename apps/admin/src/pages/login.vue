<script setup lang="ts">
import { ROUTES } from '~/types/consts/pages'
import { errorNotification, infoNotification } from '~/utils/notifications/toast'
import { z } from 'zod'


definePageMeta({
    layout: 'login',
})

const email = ref('')
const password = ref('')
const pending = ref(false)
const formError = ref<string | null>(null)

const { signInWithEmailAndPassword } = useAuth()


async function onSubmit(): Promise<void> {
    formError.value = null

    if (!z.email().safeParse(email.value).success) {
        infoNotification('Popraw błędy w formularzu', 'Nieprawidłowy adres e-mail')
        formError.value = 'Nieprawidłowy adres e-mail'
        return
    }

    if (!z.string().safeParse(password.value).success) {
        infoNotification('Popraw błędy w formularzu', 'Hasło jest wymagane')
        formError.value = 'Hasło jest wymagane'
        return
    }

    pending.value = true
    const result = await signInWithEmailAndPassword(email.value.trim(), password.value)
    pending.value = false

    if (!result.success) {
        formError.value = result.error
        errorNotification('Błąd logowania', result.error)
        return
    }

    await navigateTo(ROUTES.HOME)
}
</script>

<template>
  <div class="flex items-center justify-center px-4 h-screen">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <div class="inline-flex items-center gap-3 mb-1">
            <div class="size-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <UIcon name="i-lucide-map-pin" class="size-5 text-white" />
            </div>
            <h1 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Tri<span class="text-primary">Go</span> <span class="text-lg font-semibold text-highlighted">Admin</span>
            </h1>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Zaloguj się, aby kontynuować
          </p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <UAlert
          v-if="formError"
          color="error"
          variant="soft"
          :title="formError"
          icon="i-heroicons-exclamation-circle"
        />

        <UFormField label="E-mail" name="email" required>
          <UInput
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="twoj@email.pl"
            icon="i-heroicons-envelope"
            class="w-full"
            size="lg"
            :disabled="pending"
          />
        </UFormField>

        <UFormField label="Hasło" name="password" required>
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            class="w-full"
            size="lg"
            :disabled="pending"
          />
        </UFormField>

        <UButton
          block
          size="lg"
          :loading="pending"
          @click="onSubmit"
        >
          Zaloguj się
        </UButton>
      </form>
    </UCard>
  </div>
</template>
