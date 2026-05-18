import { Context, Next } from "hono";
import { getAppConfig } from "src/env";


export async function configInitMiddleware(c: Context, next: Next) {
    const appConfig = getAppConfig(c.env)

    if (!appConfig.success) {
        console.error(appConfig.error)
        return c.json({ error: "Config initialization failed" }, 500)
    }

    c.set('config', appConfig.data)
    return next()
}