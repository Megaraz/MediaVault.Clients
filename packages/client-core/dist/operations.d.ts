import { MediaType, type BookEntryCreateDto, type BookEntryDetailedDto, type BookEntryUpdateDto, type GameEntryCreateDto, type GameEntryDetailedDto, type GameEntryUpdateDto, type GoogleBooksDetailedDto, type LoginResponseDto, type MangaEntryCreateDto, type MangaEntryDetailedDto, type MangaEntryUpdateDto, type MediaEntryMinimalDto, type MovieEntryCreateDto, type MovieEntryDetailedDto, type MovieEntryUpdateDto, type RawgGameDetailedDto, type SearchRequestDto, type TmdbMovieDetailedDto, type TmdbTvSeriesDetailedDto, type TvSeriesEntryCreateDto, type TvSeriesEntryDetailedDto, type TvSeriesEntryUpdateDto, type UserDetailedDto, type UserLoginDto, type UserRegisterDto, type UserUpdateDto } from '@mediavault/contracts';
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
export declare function loginOperation(body: UserLoginDto): ApiOperation<LoginResponseDto>;
export declare function registerOperation(body: UserRegisterDto): ApiOperation<UserDetailedDto>;
export declare function currentUserOperation(): ApiOperation<UserDetailedDto>;
export declare function updateCurrentUserOperation(body: UserUpdateDto): ApiOperation<void>;
export declare function usersOperation(): ApiOperation<UserDetailedDto[]>;
export declare function userByIdOperation(id: string): ApiOperation<UserDetailedDto>;
export declare function deleteUserOperation(id: string): ApiOperation<void>;
export declare function mediaEntriesOperation(pageNumber?: number, pageSize?: number): ApiOperation<MediaEntryMinimalDto[]>;
export declare function searchMediaEntriesOperation(body: SearchRequestDto, page?: number, pageSize?: number): ApiOperation<MediaEntryMinimalDto[]>;
export declare function mediaEntryByIdOperation<TType extends MediaType>(mediaType: TType, id: string): ApiOperation<MediaDetailedByType[TType]>;
export declare function createMediaEntryOperation<TType extends MediaType>(mediaType: TType, body: MediaCreateByType[TType]): ApiOperation<MediaDetailedByType[TType]>;
export declare function updateMediaEntryOperation<TType extends MediaType>(mediaType: TType, id: string, body: MediaUpdateByType[TType]): ApiOperation<void>;
export declare function deleteMediaEntryOperation(id: string): ApiOperation<void>;
export declare function searchTmdbMoviesOperation(body: SearchRequestDto, page?: number, pageSize?: number, ordering?: string): ApiOperation<import('@mediavault/contracts').MediaEntryExternalSearchResultDto[]>;
export declare function tmdbMovieByIdOperation(id: number): ApiOperation<TmdbMovieDetailedDto>;
export declare function searchTmdbTvSeriesOperation(body: SearchRequestDto, page?: number, pageSize?: number, ordering?: string): ApiOperation<import('@mediavault/contracts').MediaEntryExternalSearchResultDto[]>;
export declare function tmdbTvSeriesByIdOperation(id: number): ApiOperation<TmdbTvSeriesDetailedDto>;
export declare function searchRawgGamesOperation(body: SearchRequestDto, page?: number, pageSize?: number, options?: {
    searchPrecise?: boolean;
    searchExact?: boolean;
    ordering?: string;
}): ApiOperation<import('@mediavault/contracts').MediaEntryExternalSearchResultDto[]>;
export declare function rawgGameByIdOperation(id: number): ApiOperation<RawgGameDetailedDto>;
export declare function searchGoogleBooksOperation(body: SearchRequestDto, page?: number, pageSize?: number): ApiOperation<GoogleBooksDetailedDto[]>;
export declare function googleBookByIdOperation(volumeId: string): ApiOperation<GoogleBooksDetailedDto>;
export {};
//# sourceMappingURL=operations.d.ts.map