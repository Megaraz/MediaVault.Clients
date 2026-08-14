import { CANCELLED_MESSAGE, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE, Result } from "./client";
export interface HttpResultOptions<TValue> {
    readonly decode?: (body: unknown) => NonNullable<TValue>;
}
export declare function resultFromResponse<TValue>(response: Response, options?: HttpResultOptions<TValue>): Promise<Result<TValue>>;
export declare function emptyResultFromResponse(response: Response): Promise<Result<void>>;
export declare function resultFromRequestError(error: unknown): Result<never>;
export { CANCELLED_MESSAGE, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE };
