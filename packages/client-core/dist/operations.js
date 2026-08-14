import { MediaType, } from '@mediavault/contracts';
export function loginOperation(body) {
    return json('POST', '/auth/login', body, false);
}
export function registerOperation(body) {
    return json('POST', '/auth/register', body, false);
}
export function currentUserOperation() {
    return json('GET', '/auth/me');
}
export function updateCurrentUserOperation(body) {
    return empty('PUT', '/auth', body);
}
export function usersOperation() {
    return json('GET', '/users');
}
export function userByIdOperation(id) {
    return json('GET', `/users/${segment(id)}`);
}
export function deleteUserOperation(id) {
    return empty('DELETE', `/users/${segment(id)}`);
}
export function mediaEntriesOperation(pageNumber = 1, pageSize = 25) {
    return json('GET', '/mediaentries', undefined, true, { pageNumber, pageSize });
}
export function searchMediaEntriesOperation(body, page = 1, pageSize = 10) {
    return json('POST', '/mediaentries/search', body, true, { page, pageSize });
}
export function mediaEntryByIdOperation(mediaType, id) {
    return json('GET', `/mediaentries/${mediaSegment(mediaType)}/${segment(id)}`);
}
export function createMediaEntryOperation(mediaType, body) {
    return json('POST', `/mediaentries/${mediaSegment(mediaType)}`, body);
}
export function updateMediaEntryOperation(mediaType, id, body) {
    return empty('PUT', `/mediaentries/${mediaSegment(mediaType)}/${segment(id)}`, body);
}
export function deleteMediaEntryOperation(id) {
    return empty('DELETE', `/mediaentries/${segment(id)}`);
}
export function searchTmdbMoviesOperation(body, page = 1, pageSize = 10, ordering) {
    return json('POST', '/tmdbapi/movie/search', body, true, { page, pageSize, ordering });
}
export function tmdbMovieByIdOperation(id) {
    return json('GET', `/tmdbapi/movie/${segment(id)}`);
}
export function searchTmdbTvSeriesOperation(body, page = 1, pageSize = 10, ordering) {
    return json('POST', '/tmdbapi/tv/search', body, true, { page, pageSize, ordering });
}
export function tmdbTvSeriesByIdOperation(id) {
    return json('GET', `/tmdbapi/tv/${segment(id)}`);
}
export function searchRawgGamesOperation(body, page = 1, pageSize = 8, options = {}) {
    return json('POST', '/rawgapi/search', body, true, { page, pageSize, ...options });
}
export function rawgGameByIdOperation(id) {
    return json('GET', `/rawgapi/${segment(id)}`);
}
export function searchGoogleBooksOperation(body, page = 1, pageSize = 8) {
    return json('POST', '/googlebooksapi/search', body, true, { page, pageSize });
}
export function googleBookByIdOperation(volumeId) {
    return json('GET', `/googlebooksapi/${segment(volumeId)}`);
}
function json(method, path, body, requiresAuthentication = true, query) {
    return operation(method, path, 'json', body, requiresAuthentication, query);
}
function empty(method, path, body, requiresAuthentication = true) {
    return operation(method, path, 'empty', body, requiresAuthentication);
}
function operation(method, path, responseKind, body, requiresAuthentication = true, query) {
    return Object.freeze({
        method,
        path,
        responseKind,
        requiresAuthentication,
        ...(body === undefined ? {} : { body }),
        ...(query === undefined ? {} : { query: Object.freeze({ ...query }) }),
    });
}
function mediaSegment(mediaType) {
    switch (mediaType) {
        case MediaType.Movie: return 'movies';
        case MediaType.TvSeries: return 'tv-series';
        case MediaType.Book: return 'books';
        case MediaType.Manga: return 'manga';
        case MediaType.Game: return 'games';
    }
}
function segment(value) {
    return encodeURIComponent(String(value));
}
