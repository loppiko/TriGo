type ServiceResult<T, E> =
  | { ok: true; data: T }
  | { ok: false; error: E };