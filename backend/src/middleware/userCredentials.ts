import { MiddlewareHandler } from "hono";
import { HonoVariables } from "src";
import { getSupabaseClient } from "src/db/supabase";


export function userCredentialsMiddleware(): MiddlewareHandler<{ Variables: HonoVariables }> {
    return async (c, next) => {
        const authHeader = c.req.header('Authorization')
        const tokenParts = authHeader?.split(' ')

        if (tokenParts && tokenParts.length !== 2 && tokenParts[0] !== 'Bearer') {
            const { data } = await getSupabaseClient().auth.getUser(tokenParts[1])
            c.set('userCredentials', data.user)
            return next()
        }

        c.set('userCredentials', null)
        return next()
    }
}