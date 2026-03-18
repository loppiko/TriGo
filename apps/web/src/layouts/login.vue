<script setup lang="ts">
import { useUsers } from '~/composables/database/useUsers'
import { useWorkspaces } from '~/composables/database/useWorkspaces'
import { errorNotification } from '~/utils/notifications/toast'
import { ROUTES } from '~/types/consts/pages'

const { user, signInWithGoogle } = useAuth()
const { createOrUpdateUser } = useUsers()
const { changeWorkspace } = useWorkspaces()
const router = useRouter()
const isLoading = ref(false)
const error = ref<string | null>(null)


const handleGoogleSignIn = async () => {
    isLoading.value = true
    error.value = null
    try {
        const firebaseUser = await signInWithGoogle()

        if (!firebaseUser) {
            return
        }

        const result = await createOrUpdateUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
        })

        if (!result.success) {
            error.value = result.error
            console.error('[handleGoogleSignIn]', result.error)
            errorNotification('Logowanie nie powiodło się', result.error)
            return
        }

        await changeWorkspace(result.data.uid)

        await router.push(ROUTES.HOME)
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Wystąpił błąd podczas logowania'
        error.value = message
        console.error('[handleGoogleSignIn]', String(e))
        errorNotification('Logowanie nie powiodło się', message)
    } finally {
        isLoading.value = false
    }
}

const route = useRoute()
watch(user, (newUser) => {
    if (newUser && route.path === ROUTES.LOGIN) {
        router.push(ROUTES.HOME)
    }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center dark:bg-dark">
    <UCard
      class="w-full max-w-md bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-600 divide-y divide-gray-200 dark:divide-dark-600"
    >
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">
            Zaloguj się
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Aby kontynuować, zaloguj się przez Google
          </p>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <UButton
          block
          size="xl"
          icon="i-logos-google-icon"
          variant="soft"
          :loading="isLoading"
          @click="handleGoogleSignIn"
        >
          Zaloguj się przez Google
        </UButton>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
        />
      </div>
    </UCard>
  </div>
</template>
