type ApiResponseSuccess<T> = {
    success: true
    data: T
}


type ApiResponseError<E> = {
    success: false
    error: {
        type: E
        message: string
    }
}


export type ApiResponse<T, E> = ApiResponseSuccess<T> | ApiResponseError<E>


export const apiResponse = {
    success<T>(data: T): ApiResponseSuccess<T> {
        return {
            success: true,
            data: data,
        }
    },
    
    error<E>(type: E, message: string): ApiResponseError<E> {
        return {
            success: false,
            error: { type, message },
        }
    }
}