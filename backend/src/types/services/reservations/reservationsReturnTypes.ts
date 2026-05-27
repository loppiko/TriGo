import type { ServiceResult } from "../serviceReturnTypes";


type ReservationsCreationServiceErrors =
  | "NO_DEVICE_ID_AND_CREDENTIALS"
  | "ASSIGNED_DRIVER_NO_CREDENTIALS"
  | "ASSIGNED_DRIVER_NOT_FOUND"
  | "FAILED_TO_CREATE_RESERVATION";


export type ReservationCreationServiceResult = ServiceResult<
  { reservationCode: string },
  ReservationsCreationServiceErrors
>;