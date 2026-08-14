import {
  MediaType,
  type BookEntryCreateDto,
  type BookEntryDetailedDto,
  type BookEntryUpdateDto,
  type GameEntryCreateDto,
  type GameEntryDetailedDto,
  type GameEntryUpdateDto,
  type GoogleBooksDetailedDto,
  type LoginResponseDto,
  type MangaEntryCreateDto,
  type MangaEntryDetailedDto,
  type MangaEntryUpdateDto,
  type MediaEntryMinimalDto,
  type MovieEntryCreateDto,
  type MovieEntryDetailedDto,
  type MovieEntryUpdateDto,
  type RawgGameDetailedDto,
  type SearchRequestDto,
  type TmdbMovieDetailedDto,
  type TmdbTvSeriesDetailedDto,
  type TvSeriesEntryCreateDto,
  type TvSeriesEntryDetailedDto,
  type TvSeriesEntryUpdateDto,
  type UserDetailedDto,
  type UserLoginDto,
  type UserRegisterDto,
  type UserUpdateDto,
} from '@mediavault/contracts';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type QueryValue = string | number | boolean | undefined;

export interface ApiOperation<TResponse> {
  readonly method: HttpMethod;
  readonly path: string;
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly body?: unknown;
  readonly responseKind: 'json' | 'empty';
  readonly requiresAuthentication: boolean;
  readonly __response?: TResponse;
}

type MediaCreateByType = {
  [MediaType.Movie]: MovieEntryCreateDto;
  [MediaType.TvSeries]: TvSeriesEntryCreateDto;
  [MediaType.Book]: BookEntryCreateDto;
  [MediaType.Manga]: MangaEntryCreateDto;
  [MediaType.Game]: GameEntryCreateDto;
};

type MediaUpdateByType = {
  [MediaType.Movie]: MovieEntryUpdateDto;
  [MediaType.TvSeries]: TvSeriesEntryUpdateDto;
  [MediaType.Book]: BookEntryUpdateDto;
  [MediaType.Manga]: MangaEntryUpdateDto;
  [MediaType.Game]: GameEntryUpdateDto;
};

export type MediaDetailedByType = {
  [MediaType.Movie]: MovieEntryDetailedDto;
  [MediaType.TvSeries]: TvSeriesEntryDetailedDto;
  [MediaType.Book]: BookEntryDetailedDto;
  [MediaType.Manga]: MangaEntryDetailedDto;
  [MediaType.Game]: GameEntryDetailedDto;
};

export function loginOperation(body: UserLoginDto): ApiOperation<LoginResponseDto> {
  return json('POST', '/auth/login', body, false);
}

export function registerOperation(body: UserRegisterDto): ApiOperation<UserDetailedDto> {
  return json('POST', '/auth/register', body, false);
}

export function currentUserOperation(): ApiOperation<UserDetailedDto> {
  return json('GET', '/auth/me');
}

export function updateCurrentUserOperation(body: UserUpdateDto): ApiOperation<void> {
  return empty('PUT', '/auth', body);
}

export function usersOperation(): ApiOperation<UserDetailedDto[]> {
  return json('GET', '/users');
}

export function userByIdOperation(id: string): ApiOperation<UserDetailedDto> {
  return json('GET', `/users/${segment(id)}`);
}

export function deleteUserOperation(id: string): ApiOperation<void> {
  return empty('DELETE', `/users/${segment(id)}`);
}

export function mediaEntriesOperation(pageNumber = 1, pageSize = 25): ApiOperation<MediaEntryMinimalDto[]> {
  return json('GET', '/mediaentries', undefined, true, { pageNumber, pageSize });
}

export function searchMediaEntriesOperation(
  body: SearchRequestDto,
  page = 1,
  pageSize = 10,
): ApiOperation<MediaEntryMinimalDto[]> {
  return json('POST', '/mediaentries/search', body, true, { page, pageSize });
}

export function mediaEntryByIdOperation<TType extends MediaType>(
  mediaType: TType,
  id: string,
): ApiOperation<MediaDetailedByType[TType]> {
  return json('GET', `/mediaentries/${mediaSegment(mediaType)}/${segment(id)}`);
}

export function createMediaEntryOperation<TType extends MediaType>(
  mediaType: TType,
  body: MediaCreateByType[TType],
): ApiOperation<MediaDetailedByType[TType]> {
  return json('POST', `/mediaentries/${mediaSegment(mediaType)}`, body);
}

export function updateMediaEntryOperation<TType extends MediaType>(
  mediaType: TType,
  id: string,
  body: MediaUpdateByType[TType],
): ApiOperation<void> {
  return empty('PUT', `/mediaentries/${mediaSegment(mediaType)}/${segment(id)}`, body);
}

export function deleteMediaEntryOperation(id: string): ApiOperation<void> {
  return empty('DELETE', `/mediaentries/${segment(id)}`);
}

export function searchTmdbMoviesOperation(
  body: SearchRequestDto,
  page = 1,
  pageSize = 10,
  ordering?: string,
): ApiOperation<import('@mediavault/contracts').MediaEntryExternalSearchResultDto[]> {
  return json('POST', '/tmdbapi/movie/search', body, true, { page, pageSize, ordering });
}

export function tmdbMovieByIdOperation(id: number): ApiOperation<TmdbMovieDetailedDto> {
  return json('GET', `/tmdbapi/movie/${segment(id)}`);
}

export function searchTmdbTvSeriesOperation(
  body: SearchRequestDto,
  page = 1,
  pageSize = 10,
  ordering?: string,
): ApiOperation<import('@mediavault/contracts').MediaEntryExternalSearchResultDto[]> {
  return json('POST', '/tmdbapi/tv/search', body, true, { page, pageSize, ordering });
}

export function tmdbTvSeriesByIdOperation(id: number): ApiOperation<TmdbTvSeriesDetailedDto> {
  return json('GET', `/tmdbapi/tv/${segment(id)}`);
}

export function searchRawgGamesOperation(
  body: SearchRequestDto,
  page = 1,
  pageSize = 8,
  options: { searchPrecise?: boolean; searchExact?: boolean; ordering?: string } = {},
): ApiOperation<import('@mediavault/contracts').MediaEntryExternalSearchResultDto[]> {
  return json('POST', '/rawgapi/search', body, true, { page, pageSize, ...options });
}

export function rawgGameByIdOperation(id: number): ApiOperation<RawgGameDetailedDto> {
  return json('GET', `/rawgapi/${segment(id)}`);
}

export function searchGoogleBooksOperation(
  body: SearchRequestDto,
  page = 1,
  pageSize = 8,
): ApiOperation<GoogleBooksDetailedDto[]> {
  return json('POST', '/googlebooksapi/search', body, true, { page, pageSize });
}

export function googleBookByIdOperation(volumeId: string): ApiOperation<GoogleBooksDetailedDto> {
  return json('GET', `/googlebooksapi/${segment(volumeId)}`);
}

function json<TResponse>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  requiresAuthentication = true,
  query?: Readonly<Record<string, QueryValue>>,
): ApiOperation<TResponse> {
  return operation(method, path, 'json', body, requiresAuthentication, query);
}

function empty(
  method: HttpMethod,
  path: string,
  body?: unknown,
  requiresAuthentication = true,
): ApiOperation<void> {
  return operation(method, path, 'empty', body, requiresAuthentication);
}

function operation<TResponse>(
  method: HttpMethod,
  path: string,
  responseKind: ApiOperation<TResponse>['responseKind'],
  body?: unknown,
  requiresAuthentication = true,
  query?: Readonly<Record<string, QueryValue>>,
): ApiOperation<TResponse> {
  return Object.freeze({
    method,
    path,
    responseKind,
    requiresAuthentication,
    ...(body === undefined ? {} : { body }),
    ...(query === undefined ? {} : { query: Object.freeze({ ...query }) }),
  });
}

function mediaSegment(mediaType: MediaType): string {
  switch (mediaType) {
    case MediaType.Movie: return 'movies';
    case MediaType.TvSeries: return 'tv-series';
    case MediaType.Book: return 'books';
    case MediaType.Manga: return 'manga';
    case MediaType.Game: return 'games';
  }
}

function segment(value: string | number): string {
  return encodeURIComponent(String(value));
}
