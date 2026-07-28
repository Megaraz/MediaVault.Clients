import { ErrorContext } from "./ErrorCode";
import { Result, ResultOf } from "./Result";
export declare function mapHttpResponseToResult<TValue>(response: Response | null | undefined, errorContext: ErrorContext): Promise<ResultOf<TValue>>;
export declare function mapHttpResponseToResultWithoutValue(response: Response | null | undefined, errorContext: ErrorContext): Promise<Result>;
