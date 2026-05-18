import { Hono } from 'hono'
import { AppConfig, RawEnv } from './env'
import { logger } from 'hono/logger'
import { configInitMiddleware } from './middleware/configInit'
import { firebaseInitMiddleware } from './middleware/firebaseInit'
import { reservationsRoutes } from './routes/reservations'


const app = new Hono<{ Bindings: RawEnv, Variables: { config: AppConfig } }>()
app.use(logger())
app.use('*', configInitMiddleware)
app.use('*', firebaseInitMiddleware)

app.route('/reservations', reservationsRoutes)


export default app