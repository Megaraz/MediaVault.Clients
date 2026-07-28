import { MappedHttpResponse } from "./MappedHttpResponse";
import { Result, ResultOf } from "./Result";
export declare function toHttpResponse<TValue>(result: ResultOf<TValue>): MappedHttpResponse;
export declare function toHttpResponse(result: Result): MappedHttpResponse;
export declare function toNoContentResponse(result: Result): MappedHttpResponse;
export declare function toCreatedResponse<TValue>(result: ResultOf<TValue>, location?: string): MappedHttpResponse;
