import type { Context, Next } from "hono";
import { useAppConfig } from "../env";
import { apiResponse } from "../types/core";


export async function configInitMiddleware(c: Context, next: Next) {
    const appConfigResult = useAppConfig().init(c.env)
    
    if (!appConfigResult.success) {
        console.error(appConfigResult.error)
        return c.json(apiResponse.error("CONFIG_INITIALIZATION_FAILED" as const, "Config initialization failed"), 500)
    }

    c.set('config', appConfigResult.data)
    return next()
}