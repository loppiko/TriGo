import { createReservation } from "./reservations/createReservation";


export function useReservationsHandler() {
    return {
        createReservation,
    }
} 