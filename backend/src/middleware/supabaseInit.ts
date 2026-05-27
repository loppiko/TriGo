import type { MiddlewareHandler } from "hono";
import type { HonoVariables } from "..";
import { initSupabaseClient } from "../db/supabase";


export function supabaseInitMiddleware(): MiddlewareHandler<{ Variables: HonoVariables }> {
    return async (c, next) => {
        const config = c.get('config')

        const supabaseInitResult = initSupabaseClient(config)
        if (!supabaseInitResult.success) {
            console.error("[supabaseInitMiddleware] Failed to initialize supabase client:", supabaseInitResult.error)
            return c.json({ error: "Internal Error. App initialization error." }, 500)
        }

        return next()
    }
}