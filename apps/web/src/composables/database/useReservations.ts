import {
    Timestamp,
    serverTimestamp,
    type QueryDocumentSnapshot,
    collection,
    addDoc,
    getDoc,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Result } from '#shared/types/core'
import { reservationSchema, type Reservation } from '#shared/types/reservations/schema'
import { useSessionStorage } from '../auth/useSession';
import { RESERVATION_CODE_ALPHABET } from '#shared/consts/reservations';


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
            pickupDate: Timestamp.fromDate(reservation.pickupDate),
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
    const RESERVATION_CODE_LENGTH = 6


    function createReservationCode(): string {
        const array = new Uint32Array(RESERVATION_CODE_LENGTH);

        crypto.getRandomValues(array);
        
        return Array.from(array, (value) => RESERVATION_CODE_ALPHABET[value % RESERVATION_CODE_ALPHABET.length]).join('')
    }

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


    async function findReservation(phoneNumber: string, code: string): Promise<Result<Reservation>> {
        try {
            const reservationsCol = collection(db, RESERVATIONS_COLLECTION).withConverter(reservationConverter)
            const docRef = await getDoc(reservationsCol, phoneNumber, code)
            return {
                success: true,
                data: docRef.data() as Reservation,
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to find reservation'
            console.error('[findReservation]', errorMessage, error)
            return { success: false, error: errorMessage }
        }
    }

    
    return {
        createReservation,
        createReservationCode,
    }
}