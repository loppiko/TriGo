import { Context, Next } from "hono";
import { getFirebaseDatabase } from "src/db/firebase";


export async function firebaseInitMiddleware(c: Context, next: Next) {
    const database = getFirebaseDatabase(c.get('config'))

    if (!database.success) {
        console.error(database.error)
        return c.json({ error: database.error }, 500)
    }

    return next()
}