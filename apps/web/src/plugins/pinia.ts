import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
    const pinia = createPinia()
    pinia.use(createPersistedState())

    nuxtApp.vueApp.use(pinia)
})
