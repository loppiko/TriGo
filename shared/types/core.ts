
export interface SuccessResult<T> {
    success: true;
    data: T;
}


export interface ErrorResult {
    success: false;
    error: string;
}


export interface ErrorResultWithType<T> {
    success: false;
    errorType: T;
    errorMessage: string;
}


export interface FetchErrorResult {
    success: false;
    errorCode: number;
    errorMessage: string;
    errorData?: unknown;
}


export type Result<T> = SuccessResult<T> | ErrorResult;
export type ResultWithErrorType<T, E> = SuccessResult<T> | ErrorResultWithType<E>;


export type FetchResult<T> = SuccessResult<T> | FetchErrorResult;