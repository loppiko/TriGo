import type { MiddlewareHandler } from "hono";
import type { HonoVariables } from "..";


export function corsInitMiddleware(): MiddlewareHandler<{ Variables: HonoVariables }> {
    return async (c, next) => {
        c.header('Access-Control-Allow-Origin', '*')
        c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        if (c.req.method === 'OPTIONS') {
            return c.json(null, 200)
        }

        return next()
    }
}