import type { Result } from '#shared/types/core'
import type { Reservation } from '#shared/types/reservations/schema'
import { useSessionStorage } from '~/composables/auth/useSession'
import { getHonoClient } from '~/composables/backend/hono'


export function useReservations() {
    /**
     * Sends a new reservation to the backend via Hono RPC and returns the generated reservation code.
     */


    async function createReservation(reservation: Omit<Reservation, 'id' | 'code' | 'deleted' | 'status' | 'updatedAt' | 'createdAt'>): Promise<Result<{ reservationCode: string }>> {

        try {
            const deviceId = useSessionStorage().deviceId.value

            const response = await getHonoClient().reservations.$post({ json: { ...reservation, deviceId } })
            if (!response.ok) {
                const responseText = await response.text()
                console.error('[createReservation] Backend error:', response.status, responseText)
                return { success: false, error: `Request failed with status ${response.status}` }
            }

            const data = await response.json()
            return { success: true, data }
        } catch (error) {

            if (error instanceof SyntaxError) {
                console.error('[createReservation] Invalid JSON response:', error)
                return { success: false, error: 'Invalid JSON response' }
            }

            console.error('[createReservation] Network error:', error)
            return { success: false, error: 'Network error' }
        }
    }

    return {
        createReservation,
    }
}
