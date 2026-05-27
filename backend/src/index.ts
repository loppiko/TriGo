import { Hono } from 'hono'
import type { AppConfig, RawEnv } from './env'
import { logger } from 'hono/logger'
import { configInitMiddleware } from './middleware/configInit'
import { reservationsRoutes } from './routes/reservations'
import type { User } from '@supabase/supabase-js'
import { supabaseInitMiddleware } from './middleware/supabaseInit'
import { userCredentialsMiddleware } from './middleware/userCredentials'
import { corsInitMiddleware } from './middleware/corsInit'


export type HonoVariables = {
    config: AppConfig
    userCredentials: User | null
}


const app = new Hono<{ Bindings: RawEnv, Variables: HonoVariables }>()

app.use(logger())
app.use('*', configInitMiddleware)
app.use('*', corsInitMiddleware())
app.use('*', supabaseInitMiddleware())
app.use('*', userCredentialsMiddleware())

const routes = app.route('/reservations', reservationsRoutes)


export type AppType = typeof routes
export default app