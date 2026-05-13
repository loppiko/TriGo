import { watch } from 'vue'
import { ROUTES } from '~/types/consts/pages'


/**
 * Requires authentication for all routes except the login page; redirects unauthenticated users to login.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) {
        return
    }

    const { user, authReady } = useAuth()

    async function waitUntilAuthReady(): Promise<void> {
        if (authReady.value) {
            return
        }
        await new Promise<void>((resolve) => {
            const stop = watch(
                authReady,
                (ready) => {
                    if (ready) {
                        stop()
                        resolve()
                    }
                },
                { immediate: true },
            )
        })
    }

    await waitUntilAuthReady()

    const isLoginRoute = to.path === ROUTES.LOGIN

    if (isLoginRoute) {
        if (user.value) {
            return navigateTo(ROUTES.HOME)
        }
        return
    }

    if (!user.value) {
        return navigateTo(ROUTES.LOGIN)
    }
})
