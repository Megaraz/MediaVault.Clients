import { type Result } from 'result-pattern-typescript';
import type { ApiOperation } from './operations.js';
export type MaybePromise<TValue> = TValue | Promise<TValue>;
export interface AccessTokenProvider {
    getAccessToken(): MaybePromise<string | null>;
}
export interface CoreRequest {
    readonly url: string;
    readonly method: ApiOperation<unknown>['method'];
    readonly headers: Readonly<Record<string, string>>;
    readonly body?: string;
    readonly signal?: AbortSignal;
}
export interface RequestTransport {
    send(request: CoreRequest): Promise<Response>;
}
export interface ClientCapabilities {
    readonly baseUrl: string;
    readonly accessToken: AccessTokenProvider;
    readonly transport: RequestTransport;
    readonly onUnauthorized?: (request: CoreRequest) => MaybePromise<void>;
}
export declare function executeOperation<TValue>(operation: ApiOperation<TValue>, capabilities: ClientCapabilities, signal?: AbortSignal): Promise<Result<TValue>>;
//# sourceMappingURL=capabilities.d.ts.map