import {
  emptyResultFromResponse,
  resultFromRequestError,
  resultFromResponse,
  unexpectedFailure,
  type Result,
} from 'result-pattern-typescript';
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
}

export async function executeOperation<TValue>(
  operation: ApiOperation<TValue>,
  capabilities: ClientCapabilities,
  signal?: AbortSignal,
): Promise<Result<TValue>> {
  let request: CoreRequest;
  try {
    request = await buildRequest(operation, capabilities, signal);
  } catch {
    return unexpectedFailure();
  }

  try {
    const response = await capabilities.transport.send(request);
    return operation.responseKind === 'empty'
      ? emptyResultFromResponse(response) as Promise<Result<TValue>>
      : resultFromResponse<TValue>(response);
  } catch (error) {
    return resultFromRequestError(error);
  }
}

async function buildRequest<TValue>(
  operation: ApiOperation<TValue>,
  capabilities: ClientCapabilities,
  signal?: AbortSignal,
): Promise<CoreRequest> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (operation.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (operation.requiresAuthentication) {
    const token = await capabilities.accessToken.getAccessToken();
    if (token !== null) {
      const normalized = token.trim();
      if (normalized.length === 0 || /[\r\n]/.test(normalized)) {
        throw new TypeError('The access token is not safe for an HTTP header.');
      }
      headers.Authorization = `Bearer ${normalized}`;
    }
  }

  return {
    url: buildUrl(capabilities.baseUrl, operation.path, operation.query),
    method: operation.method,
    headers: Object.freeze(headers),
    ...(operation.body === undefined ? {} : { body: JSON.stringify(operation.body) }),
    ...(signal === undefined ? {} : { signal }),
  };
}

function buildUrl(
  baseUrl: string,
  path: string,
  query: ApiOperation<unknown>['query'],
): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const entries = Object.entries(query ?? {}).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return `${normalizedBase}${normalizedPath}`;

  const search = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${normalizedBase}${normalizedPath}?${search}`;
}
