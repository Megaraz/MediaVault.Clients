import {
  executeOperation,
  type ApiOperation,
  type ClientCapabilities,
  type CoreRequest,
} from '@mediavault/client-core';
import { getToken } from './tokenStore';
import { clearSessionForRequest } from './sessionLifecycle';

const API_BASE_URL = resolveApiBaseUrl(
  process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL,
  __DEV__,
);

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

function resolveApiBaseUrl(value: string | undefined, isDevelopment: boolean): string {
  if (value === undefined || value.trim().length === 0) {
    if (isDevelopment) {
      return 'http://localhost:5210';
    }

    throw new Error(
      'EXPO_PUBLIC_MEDIA_VAULT_API_URL is required outside explicit development mode.',
    );
  }

  let apiUrl: URL;
  try {
    apiUrl = new URL(value);
  } catch {
    throw new Error('EXPO_PUBLIC_MEDIA_VAULT_API_URL must be an absolute URL.');
  }

  if (
    apiUrl.username.length > 0
    || apiUrl.password.length > 0
    || apiUrl.search.length > 0
    || apiUrl.hash.length > 0
  ) {
    throw new Error(
      'EXPO_PUBLIC_MEDIA_VAULT_API_URL must not contain credentials, a query, or a fragment.',
    );
  }

  if (!isDevelopment) {
    const hostname = apiUrl.hostname.toLowerCase();
    if (
      apiUrl.protocol !== 'https:'
      || hostname === 'localhost'
      || hostname.endsWith('.localhost')
      || hostname === '127.0.0.1'
      || hostname === '::1'
    ) {
      throw new Error(
        'EXPO_PUBLIC_MEDIA_VAULT_API_URL must be a non-localhost HTTPS URL outside development mode.',
      );
    }
  } else if (apiUrl.protocol !== 'http:' && apiUrl.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_MEDIA_VAULT_API_URL must use HTTP or HTTPS.');
  }

  return apiUrl.href.replace(/\/$/, '');
}
