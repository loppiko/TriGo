import type { Reservation } from '#shared/types/models/reservations/schema'
import { defineStore } from 'pinia'


export const useReservationStore = defineStore('reservationStore', () => {
    const reservations = ref<Reservation[]>([])
    
    function addReservation(newReservation: Reservation): void {
        if (reservations.value.some((reservation) => reservation.id === newReservation.id)) {
            return
        }

        reservations.value.push(newReservation)
        reservations.value = reservations.value.toSorted((a: Reservation, b: Reservation) => new Date(a.pickupAt).getTime() - new Date(b.pickupAt).getTime())
    }


    function getReservationByCode(code: string): Reservation | undefined {
        return reservations.value.find((reservation: Reservation) => reservation.code === code)
    }
    
    
    return {
        reservations,
        addReservation,
        getReservationByCode,
    }
}, {
    persist: true,
})