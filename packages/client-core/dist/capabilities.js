import { emptyResultFromResponse, resultFromRequestError, resultFromResponse, unexpectedFailure, } from 'result-pattern-typescript';
export async function executeOperation(operation, capabilities, signal) {
    let request;
    try {
        request = await buildRequest(operation, capabilities, signal);
    }
    catch {
        return unexpectedFailure();
    }
    try {
        const response = await capabilities.transport.send(request);
        if (operation.requiresAuthentication && response.status === 401) {
            await capabilities.onUnauthorized?.(request);
        }
        return operation.responseKind === 'empty'
            ? emptyResultFromResponse(response)
            : resultFromResponse(response);
    }
    catch (error) {
        return resultFromRequestError(error);
    }
}
async function buildRequest(operation, capabilities, signal) {
    const headers = { Accept: 'application/json' };
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
function buildUrl(baseUrl, path, query) {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const entries = Object.entries(query ?? {}).filter(([, value]) => value !== undefined);
    if (entries.length === 0)
        return `${normalizedBase}${normalizedPath}`;
    const search = entries
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
    return `${normalizedBase}${normalizedPath}?${search}`;
}
