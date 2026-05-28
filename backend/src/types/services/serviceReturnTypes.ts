export type ServiceResult<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };