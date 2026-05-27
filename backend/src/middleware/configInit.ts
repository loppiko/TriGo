import { Context, Next } from "hono";
import { useAppConfig } from "src/env";


export async function configInitMiddleware(c: Context, next: Next) {
    const appConfigResult = useAppConfig().init(c.env)
    
    if (!appConfigResult.success) {
        console.error(appConfigResult.error)
        return c.json({ error: "Config initialization failed" }, 500)
    }

    c.set('config', appConfigResult.data)
    return next()
}