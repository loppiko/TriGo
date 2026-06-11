<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'


const navigationItems: NavigationMenuItem[] = [
    {
        label: 'Informacje o nas',
        icon: 'i-lucide-info',
        to: '/about',
    },
    {
        label: 'Rezerwacja przejazdu',
        icon: 'i-lucide-car',
        to: '/',
    },
    {
        label: 'Sprawdź rezerwację',
        icon: 'i-lucide-search',
        to: '/check',
    },
]
</script>

<template>
  <div class="min-h-screen flex flex-col dark:bg-dark">
    <header class="w-full bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-700 shadow-sm">
      <div class="relative max-w-7xl mx-auto px-5 h-14 flex items-center justify-center">
        <NuxtLink to="/" class="absolute ml-4 left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-3">
          <div class="size-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20"/>
          <span class="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Tri<span class="text-primary">Go</span>
          </span>
        </NuxtLink>

        <UNavigationMenu
          :items="navigationItems"
          variant="link"
          highlight
          highlight-color="primary"
          class="w-full justify-end min-[850px]:justify-center"
          :ui="{
            link: 'px-3 py-2 rounded-none gap-0 min-[850px]:gap-2 after:h-[2px] group',
            linkLeadingIcon: 'hidden',
            linkLabel: 'font-medium text-sm',
          }"
        >
          <template #item-leading="{ item, active }">
            <span
              class="size-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200"
              :class="active ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-600'"
            >
              <UIcon
                :name="(item.icon as string)"
                class="size-4 transition-transform duration-300"
                :class="[
                  active ? 'text-white' : 'text-gray-400 dark:text-gray-500',
                  item.icon === 'i-lucide-car' ? 'nav-icon-car' : 'nav-icon-up',
                ]"
              />
            </span>
          </template>
          <template #item-label="{ item, active }">
            <span
              class="hidden min-[850px]:inline transition-colors duration-200"
              :class="active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'"
            >
              {{ item.label }}
            </span>
          </template>
        </UNavigationMenu>
      </div>
    </header>
    <main class="flex-1 overflow-hidden h-full">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Car: slides right on hover, returns on blur */
.nav-icon-car {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.group:hover .nav-icon-car {
  transform: translateX(2px);
}

/* Info & search: bounce up on hover, return on blur */
.nav-icon-up {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.group:hover .nav-icon-up {
  transform: translateY(-2px);
}
</style>
