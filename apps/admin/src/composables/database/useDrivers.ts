import {
    Timestamp,
    serverTimestamp,
    type QueryDocumentSnapshot,
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
} from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import type { Result } from '#shared/types/core'
import type { Driver } from '#shared/types/drivers/schema'


const driverConverter = {
    toFirestore(driver: Driver): Record<string, unknown> {
        return {
            ...driver,
            createdAt: (driver.createdAt) ? Timestamp.fromDate(driver.createdAt) : serverTimestamp(),
            updatedAt: (driver.updatedAt) ? Timestamp.fromDate(driver.updatedAt) : serverTimestamp(),
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): Driver {
        const data = snapshot.data()
        return {
            ...data,
            id: snapshot.id,
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : undefined,
            updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
        } as Driver
    },
}


export function useDrivers() {
    const db = useFirestore()
    const DRIVERS_COLLECTION = 'drivers'


    const driversQuery = query(collection(db, DRIVERS_COLLECTION).withConverter(driverConverter))

    const {data: drivers, error: driversError, pending: driversPending} = useCollection(driversQuery)

    /**
     * Persists a new driver document.
     */
    async function createDriver(driver: Driver): Promise<Result<Driver>> {
        const { id: _clientId, ...driverWithoutClientId } = driver

        try {
            const driversCol = collection(db, DRIVERS_COLLECTION).withConverter(driverConverter)
            const docRef = await addDoc(driversCol, driverWithoutClientId)
            return {
                success: true,
                data: { ...driverWithoutClientId, id: docRef.id },
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create driver'
            console.error('[createDriver]', errorMessage, error)
            return { success: false, error: errorMessage }
        }
    }


    /**
     * Partial update without reading the document first; only the patch is validated with Zod.
     */
    async function updateDriver(
        id: string,
        updates: Partial<Driver>,
    ): Promise<Result<void>> {
        if (!id) {
            console.error('[updateDriver] Invalid driver ID')
            return { success: false, error: 'Invalid driver ID' }
        }

        try {
            await updateDoc(doc(db, DRIVERS_COLLECTION, id), updates)
            return { success: true, data: undefined }
        } catch (error) {
            console.error('[updateDriver]', String(error), error)
            return { success: false, error: String(error) }
        }
    }


    /**
     * Removes the driver document from Firestore.
     */
    async function deleteDriver(id: string): Promise<Result<void>> {
        if (!id) {
            console.error('[deleteDriver] Invalid driver ID')
            return { success: false, error: 'Invalid driver ID' }
        }

        try {
            await deleteDoc(doc(db, DRIVERS_COLLECTION, id))
            return { success: true, data: undefined }
        } catch (error) {
            console.error('[deleteDriver]', String(error), error)
            return { success: false, error: String(error) }
        }
    }

    return {
        drivers,
        driversError,
        driversPending,
        createDriver,
        updateDriver,
        deleteDriver,
    }
}
