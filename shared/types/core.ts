
export interface SuccessResult<T> {
    success: true;
    data: T;
}


export interface ErrorResult {
    success: false;
    error: string;
}


export type Result<T> = SuccessResult<T> | ErrorResult;