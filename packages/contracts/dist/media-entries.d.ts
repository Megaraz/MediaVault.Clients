import type { MediaType, Status } from './enums.js';
import type { SeasonCreateDto, SeasonMinimalDto, SeasonUpdateDto } from './seasons.js';
export interface MediaEntryDetailedDto {
    id: string;
    idExternal: string | null;
    userId: string;
    status: Status;
    title: string;
    rating: number;
    overview: string | null;
    review: string | null;
    genres: string[];
    releaseDate: string;
    imageUrl: string | null;
    mediaType: MediaType;
    createdAtUtc: string;
}
export interface MediaEntryMinimalDto {
    id: string;
    title: string | null;
    status: Status;
    genres: string[];
    releaseDate: string;
    mediaType: MediaType;
    rating: number;
    imageUrl: string | null;
    createdAtUtc: string;
}
export interface MediaEntryCreateDto {
    idExternal?: string | null;
    status: Status;
    title: string;
    overview?: string | null;
    rating: number;
    review?: string | null;
    genres?: string[];
    releaseDate?: string;
    imageUrl?: string | null;
}
export type MediaEntryUpdateDto = MediaEntryCreateDto;
export interface MediaEntryExternalSearchResultDto {
    idExternal: string;
    title: string;
    coverImageUrl: string | null;
    mediaType: MediaType;
}
export interface MediaEntryInternalSearchResultDto {
    id: string;
    title: string;
    coverImageUrl: string | null;
    mediaType: MediaType;
}
/** `page` is retained because it exists on the API DTO, although controllers use query paging. */
export interface SearchRequestDto {
    query: string;
    page?: number;
}
export interface BookEntryDetailedDto extends MediaEntryDetailedDto {
    author: string | null;
}
export interface BookEntryCreateDto extends MediaEntryCreateDto {
    author?: string | null;
}
export type BookEntryUpdateDto = BookEntryCreateDto;
export interface MangaEntryDetailedDto extends MediaEntryDetailedDto {
    author: string | null;
}
export interface MangaEntryCreateDto extends MediaEntryCreateDto {
    author?: string | null;
}
export type MangaEntryUpdateDto = MangaEntryCreateDto;
export interface MovieEntryDetailedDto extends MediaEntryDetailedDto {
    runtimeMinutes: number;
}
export interface MovieEntryCreateDto extends MediaEntryCreateDto {
    runtimeMinutes?: number;
}
export type MovieEntryUpdateDto = MovieEntryCreateDto;
export interface GamePcRequirementsDto {
    minimum: string | null;
    recommended: string | null;
    high: string | null;
    veryHigh: string | null;
    ultra: string | null;
}
export interface GameEntryDetailedDto extends MediaEntryDetailedDto {
    hoursPlayed: number;
    metacriticRating: number;
    website: string | null;
    platforms: string[];
    pcRequirements: GamePcRequirementsDto | null;
}
export interface GameEntryCreateDto extends MediaEntryCreateDto {
    hoursPlayed?: number;
    metacriticRating?: number;
    website?: string | null;
    platforms?: string[];
    pcRequirements?: GamePcRequirementsDto | null;
}
export type GameEntryUpdateDto = GameEntryCreateDto;
export interface TvSeriesEntryDetailedDto extends MediaEntryDetailedDto {
    backdropImageUrl: string | null;
    lastAirDate: string | null;
    numberOfSeasons: number;
    numberOfEpisodes: number;
    airingStatus: string | null;
    totalWatchedEpisodes: number;
    seasons: SeasonMinimalDto[];
}
export interface TvSeriesEntryCreateDto extends MediaEntryCreateDto {
    backdropImageUrl?: string | null;
    lastAirDate?: string | null;
    numberOfSeasons?: number;
    numberOfEpisodes?: number;
    airingStatus?: string | null;
    totalWatchedEpisodes?: number;
    seasons: SeasonCreateDto[];
}
export interface TvSeriesEntryUpdateDto extends MediaEntryCreateDto {
    backdropImageUrl?: string | null;
    lastAirDate?: string | null;
    numberOfSeasons?: number;
    numberOfEpisodes?: number;
    airingStatus?: string | null;
    totalWatchedEpisodes?: number;
    seasons: SeasonUpdateDto[];
}
//# sourceMappingURL=media-entries.d.ts.map