import { Context } from "hono";


export function useReservationsHandler() {
    return {
        updateReservation,
    }
} 


async function updateReservation(c: Context) {
    const code = c.req.param('code')
    const config = c.get('config')

    return c.json({ message: `Reservation updated: ${code}. Config: ${JSON.stringify(config)}` })
}