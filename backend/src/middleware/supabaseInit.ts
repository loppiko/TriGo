import { MiddlewareHandler } from "hono";
import { HonoVariables } from "src";
import { initSupabaseClient } from "src/db/supabase";


export function supabaseInitMiddleware(): MiddlewareHandler<{ Variables: HonoVariables }> {
    return async (c, next) => {
        const config = c.get('config')

        const supabaseInitResult = initSupabaseClient(config)
        if (!supabaseInitResult.success) {
            console.error(supabaseInitResult.error)
            return c.json({ error: "Internal Error. App initialization error." }, 500)
        }

        return next()
    }
}