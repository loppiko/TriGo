<script setup lang="ts">
import { useWorkspaces } from '~/composables/database/useWorkspaces'
import { ROUTES } from '~/types/consts/pages'

const { user, signOut } = useAuth()
const { changeWorkspace, clearCurrentWorkspace } = useWorkspaces()
const authReady = useState('firebase-auth-ready', () => false)
const router = useRouter()
const route = useRoute()

watch([authReady, user], ([ready, u]) => {
    if (ready && !u) {
        clearCurrentWorkspace()
        router.replace(ROUTES.LOGIN)
    } else if (ready && u) {
        changeWorkspace(u.uid)
    }
}, { immediate: true })

const handleSignOut = async () => {
    await signOut()
    clearCurrentWorkspace()
    await router.push(ROUTES.LOGIN)
}

const navItems = [
    { label: 'Strona główna', to: ROUTES.HOME, icon: 'i-heroicons-home' },
    { label: 'Przedmioty', to: ROUTES.SUBJECTS, icon: 'i-heroicons-book-open' },
    { label: 'Klasy', to: ROUTES.CLASSES, icon: 'i-heroicons-academic-cap' },
    { label: 'Nauczyciele', to: ROUTES.TEACHERS, icon: 'i-heroicons-user-group' },
]

const isActive = (path: string) => route.path === path

const colorMode = useColorMode()
const isDark = computed({
    get() {
        return colorMode.value === 'dark'
    },
    set() {
        colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    },
})
</script>

<template>
  <div v-if="!authReady" class="min-h-screen flex items-center justify-center">
    <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-primary" />
  </div>
  <div v-else class="flex min-h-screen dark:bg-dark">
    <aside class="w-56 shrink-0 flex flex-col border-r border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800">
      <div class="p-4 border-b border-gray-200 dark:border-dark-600">
        <h2 class="font-semibold text-lg">
          Menu
        </h2>
      </div>
      <nav class="flex-1 p-2 flex flex-col gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          :class="isActive(item.to)
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'"
        >
          <UIcon :name="item.icon" class="size-5 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="p-2 border-t border-gray-200 dark:border-dark-600">
        <UButton
          block
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-right-on-rectangle"
          @click="handleSignOut"
        >
          Wyloguj
        </UButton>
        <ClientOnly>
          <UButton
            block
            variant="ghost"
            color="neutral"
            :icon="isDark ? 'i-heroicons-sun-20-solid' : 'i-heroicons-moon-20-solid'"
            class="mt-1"
            @click="isDark = !isDark"
          >
            {{ isDark ? 'Jasny' : 'Ciemny' }} motyw
          </UButton>
        </ClientOnly>
      </div>
    </aside>
    <main class="flex-1 flex flex-col min-w-0">
      <div class="flex justify-end p-4 border-b border-gray-200 dark:border-dark-600">
        <UBadge color="info" variant="soft" class="font-bold" size="lg">
          Plan AG
        </UBadge>
      </div>
      <div class="flex-1 overflow-auto">
        <slot />
      </div>
    </main>
  </div>
</template>
