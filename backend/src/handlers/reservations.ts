import { createReservation } from "./reservations/createReservation";
import { getReservationByCode } from "./reservations/getReservationByCode";


export function useReservationsHandler() {
    return {
        createReservation,
        getReservationByCode,
    }
} 