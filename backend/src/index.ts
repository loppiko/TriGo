import { Hono } from 'hono'
import { AppConfig, RawEnv } from './env'
import { logger } from 'hono/logger'
import { configInitMiddleware } from './middleware/configInit'
import { reservationsRoutes } from './routes/reservations'
import { User } from '@supabase/supabase-js'
import { supabaseInitMiddleware } from './middleware/supabaseInit'
import { userCredentialsMiddleware } from './middleware/userCredentials'


export type HonoVariables = {
    config: AppConfig
    userCredentials: User | null
}


const app = new Hono<{ Bindings: RawEnv, Variables: HonoVariables }>()

app.use(logger())
app.use('*', configInitMiddleware)
app.use('*', supabaseInitMiddleware())
app.use('*', userCredentialsMiddleware())

app.route('/reservations', reservationsRoutes)


export default app