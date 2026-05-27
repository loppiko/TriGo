import type { AppType } from '#backend/index'
import { hc } from 'hono/client'


/** Returns a Hono RPC client configured with the runtime backend URL. */
export function getHonoClient() {
    const { public: { backendUrl } } = useRuntimeConfig()
    return hc<AppType>(backendUrl as string)
}
