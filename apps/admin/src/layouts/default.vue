<script setup lang="ts">
import { ROUTES } from '~/types/consts/pages'
import { errorNotification } from '~/utils/notifications/toast'


const route = useRoute()
const colorMode = useColorMode()
const { signOut, user } = useAuth()
const logoutPending = ref(false)

const userEmail = computed(() => user.value?.email ?? '')

const isReservationsActive = computed(
    () =>
        route.path === ROUTES.HOME
        || route.path.startsWith('/reservations'),
)

const isDriversActive = computed(
    () =>
        route.path === ROUTES.DRIVERS
        || route.path.startsWith(`${ROUTES.DRIVERS}/`),
)


function toggleTheme(): void {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}


const settingsMenuItems = computed(() => [
    {
        label: colorMode.value === 'dark' ? 'Motyw jasny' : 'Motyw ciemny',
        icon: colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon',
        onSelect: () => {
            toggleTheme()
        },
    },
    {
        label: 'Wyloguj',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        disabled: logoutPending.value,
        loading: logoutPending.value,
        onSelect: () => {
            void handleSignOut()
        },
    },
])


async function handleSignOut(): Promise<void> {
    logoutPending.value = true
    const result = await signOut()
    logoutPending.value = false

    if (!result.success) {
        errorNotification('Wylogowanie nie powiodło się', result.error)
        console.error(result.error)
        return
    }

    await navigateTo(ROUTES.LOGIN)
}
</script>

<template>
  <div class="flex min-h-screen dark:bg-dark">
    <aside
      class="flex min-h-screen w-56 shrink-0 flex-col border-r border-default bg-[var(--ui-bg-elevated)]"
      aria-label="Menu główne"
    >
      <NuxtLink
        :to="ROUTES.HOME"
        class="mx-auto flex shrink-0 items-center gap-2.5 px-3 pb-0 pt-4 no-underline hover:opacity-90"
      >
        <div class="size-9 shrink-0 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <UIcon name="i-lucide-map-pin" class="size-[18px] text-white" />
        </div>
        <span class="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
          Tri<span class="text-primary">Go</span>
          <span class="block text-xs font-semibold text-muted">Admin</span>
        </span>
      </NuxtLink>

      <nav class="mt-16 flex min-h-0 flex-1 flex-col gap-1 px-3 pb-3">
        <UButton
          :to="ROUTES.HOME"
          icon="i-heroicons-home"
          block
          :color="isReservationsActive ? 'primary' : 'neutral'"
          variant="soft"
        >
          Rezerwacje
        </UButton>
        <UButton
          :to="ROUTES.DRIVERS"
          icon="i-heroicons-users"
          block
          :color="isDriversActive ? 'primary' : 'neutral'"
          variant="soft"
        >
          Kierowcy
        </UButton>
      </nav>

      <div class="mt-auto space-y-3 border-t border-default px-3 pt-3 pb-3">
        <div
          class="flex min-w-0 items-center gap-2.5 px-1"
          :title="userEmail || undefined"
        >
          <UIcon
            name="i-heroicons-user-circle"
            class="size-6 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span class="truncate text-sm text-highlighted">
            {{ userEmail || '—' }}
          </span>
        </div>

        <UDropdownMenu
          class="w-full"
          :items="settingsMenuItems"
          :content="{
            side: 'top',
            sideOffset: 8,
            align: 'start',
          }"
          :ui="{ content: 'min-w-56' }"
        >
          <UButton
            class="w-full"
            block
            icon="i-heroicons-cog-6-tooth"
            trailing-icon="i-heroicons-chevron-up"
            color="neutral"
            variant="outline"
            label="Ustawienia"
          />
        </UDropdownMenu>
      </div>
    </aside>
    <main class="min-w-0 flex-1">
      <slot />
    </main>
  </div>
</template>
