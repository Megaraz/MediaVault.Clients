import {
  executeOperation,
  type ApiOperation,
  type ClientCapabilities,
  type CoreRequest,
} from '@mediavault/client-core';
import { getToken } from './tokenStore';
import { clearSessionForRequest } from './sessionLifecycle';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

const mobileClientCapabilities: ClientCapabilities = {
  baseUrl: API_BASE_URL,
  accessToken: { getAccessToken: getToken },
  transport: {
    send: (request: CoreRequest) => fetch(request.url, toRequestInit(request)),
  },
  onUnauthorized: (request) => clearSessionForRequest(request.headers.Authorization),
};

type MobileClientFailure = {
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

type MobileClientResult<TValue> =
  | { readonly ok: true; readonly value: TValue }
  | MobileClientFailure;

export class MobileClientError extends Error {
  readonly result: MobileClientFailure;

  constructor(result: MobileClientFailure) {
    super(result.error.message);
    this.name = 'MobileClientError';
    this.result = result;
  }
}

export async function executeMobileOperation<TValue>(
  operation: ApiOperation<TValue>,
  signal?: AbortSignal,
): Promise<TValue> {
  const result = await executeOperation(operation, mobileClientCapabilities, signal);
  return unwrapResult(result);
}

export function throwOnFailure(result: MobileClientResult<unknown>): void {
  if (!result.ok) {
    throw new MobileClientError(result);
  }
}

function unwrapResult<TValue>(result: MobileClientResult<TValue>): TValue {
  if (!result.ok) {
    throw new MobileClientError(result);
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
