export interface ErrorResponseBody {
    message: string;
    code: string;
}
export interface ValidationErrorItem {
    field: string | null;
    message: string;
}
export interface ValidationErrorResponseBody {
    message: string;
    validationErrors: ValidationErrorItem[] | null;
}
//# sourceMappingURL=errors.d.ts.map