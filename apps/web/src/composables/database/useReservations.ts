import {
    Timestamp,
    serverTimestamp,
    type QueryDocumentSnapshot,
    collection,
    addDoc,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Result } from '#shared/types/core'
import { reservationSchema, type Reservation } from '#shared/types/reservations/schema'
import { useSessionStorage } from '../auth/useSession';


const reservationConverter = {
    toFirestore(reservation: Reservation): Record<string, unknown> {
        const validated = reservationSchema.parse(reservation)
        const sessionDeviceId = useSessionStorage().deviceId.value

        if (!sessionDeviceId) {
            throw new Error('Session device ID is not set')
        }

        return {
            ...validated,
            deviceId: sessionDeviceId,
            createdAt: (reservation.createdAt) ? Timestamp.fromDate(reservation.createdAt) : serverTimestamp(),
            updatedAt: (reservation.updatedAt) ? Timestamp.fromDate(reservation.updatedAt) : serverTimestamp(),
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): Reservation {
        return snapshot.data() as Reservation
    },
}


export function useReservations() {
    const db = useFirestore()
    const RESERVATIONS_COLLECTION = 'reservations'

    /**
     * Persists a new reservation.
     */
    async function createReservation(reservation: Reservation): Promise<Result<Reservation>> {
        const { id: _clientId, ...reservationWithoutClientId } = reservation

        try {
            const reservationsCol = collection(db, RESERVATIONS_COLLECTION).withConverter(reservationConverter)
            const docRef = await addDoc(reservationsCol, reservationWithoutClientId)
            return {
                success: true,
                data: { ...reservationWithoutClientId, id: docRef.id },
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create reservation'
            console.error('[createReservation]', errorMessage, error)
            return { success: false, error: errorMessage }
        }
    }

    return {
        createReservation,
    }
}