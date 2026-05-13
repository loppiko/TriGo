import {
    Timestamp,
    serverTimestamp,
    type QueryDocumentSnapshot,
    collection,
    addDoc,
    doc,
    updateDoc,
    query,
    orderBy,
} from 'firebase/firestore'
import { useDocument, useFirestore } from 'vuefire'
import type { Result } from '#shared/types/core'
import type { Reservation } from '#shared/types/reservations/schema'


const reservationConverter = {
    toFirestore(reservation: Reservation): Record<string, unknown> {
        return {
            ...reservation,
            createdAt: (reservation.createdAt) ? Timestamp.fromDate(reservation.createdAt) : serverTimestamp(),
            updatedAt: (reservation.updatedAt) ? Timestamp.fromDate(reservation.updatedAt) : serverTimestamp(),
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): Reservation {
        const data = snapshot.data()
        return {
            ...data,
            id: snapshot.id,
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : undefined,
            updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
            pickupDate: (data.pickupDate as Timestamp).toDate(),
        } as Reservation
    },
}


export function useReservations() {
    const db = useFirestore()
    const RESERVATIONS_COLLECTION = 'reservations'

    
    const reservationsQuery = query(
        collection(db, RESERVATIONS_COLLECTION),
        orderBy('pickupDate', 'desc')
    ).withConverter(reservationConverter)
    
    const {data: reservations, error: reservationsError, pending: reservationsPending} = useCollection(reservationsQuery)

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
            console.error('[createReservation]', String(error), error)
            return { success: false, error: String(error) }
        }
    }


    /**
     * Applies a partial update without reading the document first. Only the provided fields are validated (Zod patch).
     */
    async function updateReservation(
        id: string,
        updates: Partial<Reservation>,
    ): Promise<Result<void>> {
        if (!id) {
            console.error('[updateReservation] Invalid reservation ID')
            return { success: false, error: 'Invalid reservation ID' }
        }

        try {
            await updateDoc(doc(db, RESERVATIONS_COLLECTION, id), updates)
            return { success: true, data: undefined }
        } catch (error) {
            console.error('[updateReservation]', String(error), error)
            return { success: false, error: String(error) }
        }
    }


    /**
     * Soft-deletes by setting `deleted: true` via `updateDoc` (no prior read).
     */
    async function deleteReservation(id: string): Promise<Result<void>> {
        if (!id) {
            console.error('[deleteReservation] Invalid reservation ID')
            return { success: false, error: 'Invalid reservation ID' }
        }

        try {
            await updateDoc(doc(db, RESERVATIONS_COLLECTION, id), {
                deleted: true,
            })
            return { success: true, data: undefined }
        } catch (error) {
            console.error('[deleteReservation]', String(error), error)
            return { success: false, error: String(error) }
        }
    }

    /**
     * Subscribes to a single reservation document by ID for the detail page.
     */
    function useReservationById(id: string) {
        const docRef = doc(db, RESERVATIONS_COLLECTION, id).withConverter(reservationConverter)
        return useDocument<Reservation>(docRef)
    }

    return {
        reservations,
        reservationsError,
        reservationsPending,
        createReservation,
        updateReservation,
        deleteReservation,
        useReservationById,
    }
}
