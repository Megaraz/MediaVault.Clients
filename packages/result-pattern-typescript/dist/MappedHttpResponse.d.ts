export interface MappedHttpResponse {
    statusCode: number;
    body?: unknown;
    location?: string;
}
export interface ErrorResponseBody {
    message: string;
    code: string;
}
export interface ValidationErrorItem {
    field?: string;
    message: string;
}
export interface ValidationErrorResponseBody {
    message: string;
    validationErrors?: readonly ValidationErrorItem[];
}
