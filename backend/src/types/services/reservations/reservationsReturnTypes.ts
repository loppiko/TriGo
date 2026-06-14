import type { Reservation } from "#shared/types/models/reservations/schema";
import type { ServiceResult } from "../serviceReturnTypes";


type ReservationsCreationServiceErrors =
  | "NO_DEVICE_ID_AND_CREDENTIALS"
  | "ASSIGNED_DRIVER_NO_CREDENTIALS"
  | "ASSIGNED_DRIVER_NOT_FOUND"
  | "FAILED_TO_CREATE_RESERVATION";


export type ReservationCreationServiceResult = ServiceResult<
  { reservation: Reservation },
  ReservationsCreationServiceErrors
>;


type ReservationsGetByCodeServiceErrors =
  | "DEVICE_ID_ACCESS_LIMIT_REACHED"
  | "RESERVATION_CODE_ACCESS_LIMIT_REACHED"
  | "INVALID_CODE_OR_PHONE_NUMBER"
  | "FAILED_TO_GET_RESERVATION";


export type ReservationGetByCodeServiceResult = ServiceResult<
  { reservation: Reservation },
  ReservationsGetByCodeServiceErrors
>;