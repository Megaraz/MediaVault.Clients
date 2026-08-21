import {
    executeOperation,
    type ApiOperation,
    type ClientCapabilities,
    type CoreRequest,
} from "@mediavault/client-core";

const TOKEN_KEY = 'media_vault_auth_token';
const API_BASE_URL = import.meta.env.DEV
    ? ""
    : import.meta.env.VITE_MEDIA_VAULT_API_URL;

// Remove tokens persisted by releases before the session-scoped storage policy.
localStorage.removeItem(TOKEN_KEY);

export function saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
}

const webClientCapabilities: ClientCapabilities = {
    baseUrl: API_BASE_URL,
    accessToken: { getAccessToken: getToken },
    transport: {
        send: (request: CoreRequest) => fetch(request.url, toRequestInit(request)),
    },
};

export type ClientFailure = {
    readonly ok: false;
    readonly error: {
        readonly kind: string;
        readonly code: string;
        readonly message: string;
    };
    readonly validationErrors: readonly {
        readonly field: string | null;
        readonly message: string;
    }[];
};

type ClientResult<TValue> =
    | { readonly ok: true; readonly value: TValue }
    | ClientFailure;

export class WebClientError extends Error {
    readonly result: ClientFailure;

    constructor(result: ClientFailure) {
        super(result.error.message);
        this.name = "WebClientError";
        this.result = result;
    }
}

export async function executeWebOperation<TValue>(
    operation: ApiOperation<TValue>,
    signal?: AbortSignal,
): Promise<TValue> {
    const result = await executeOperation(operation, webClientCapabilities, signal);
    return unwrapResult(result);
}

export function throwOnFailure(result: ClientResult<unknown>): void {
    if (!result.ok) {
        throw new WebClientError(result);
    }
}

function unwrapResult<TValue>(result: ClientResult<TValue>): TValue {
    if (!result.ok) {
        throw new WebClientError(result);
    }

    return result.value;
}

function toRequestInit(request: CoreRequest): RequestInit {
    return {
        method: request.method,
        headers: { ...request.headers },
        ...(request.body === undefined ? {} : { body: request.body }),
        ...(request.signal === undefined ? {} : { signal: request.signal }),
    };
}
