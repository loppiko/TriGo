
export interface SuccessResult<T> {
    success: true;
    data: T;
}


export interface ErrorResult {
    success: false;
    error: string;
}


export interface FetchErrorResult {
    success: false;
    errorCode: number;
    errorMessage: string;
    errorData?: unknown;
}


export type Result<T> = SuccessResult<T> | ErrorResult;


export type FetchResult<T> = SuccessResult<T> | FetchErrorResult;