import type { MediaType } from './enums.js';
import type { GamePcRequirementsDto, MediaEntryExternalSearchResultDto } from './media-entries.js';
export interface GoogleBooksDetailedDto {
    author: string;
    externalId: string;
    title: string;
    coverImageUrl: string | null;
    mediaType: MediaType;
}
export interface RawgGameDetailedDto {
    rawgId: number;
    rawgSlug: string | null;
    rawgName: string | null;
    rawgDescription: string | null;
    rawgMetacritic: number;
    rawgReleased: string | null;
    rawgBackgroundImage: string | null;
    rawgWebsite: string | null;
    rawgPlatforms: string[];
    rawgRequirements: GamePcRequirementsDto | null;
}
export type RawgSearchResultDto = MediaEntryExternalSearchResultDto;
export interface TmdbGenreDto {
    tmdbGenreId: number;
    tmdbGenreName: string | null;
}
export interface TmdbMovieDetailedDto {
    tmdbBackdropPath: string | null;
    tmdbReleaseDate: string | null;
    tmdbGenres: TmdbGenreDto[];
    tmdbMovieId: number;
    tmdbOverview: string | null;
    tmdbPosterPath: string | null;
    tmdbTitle: string | null;
    tmdbRunTimeMinutes: number;
}
export interface TmdbSeasonDto {
    tmdbAirDate: string | null;
    tmdbEpisodeCount: number;
    tmdbName: string | null;
    tmdbOverview: string | null;
    tmdbPosterPath: string | null;
    tmdbSeasonNumber: number;
}
export interface TmdbTvSeriesDetailedDto {
    tmdbBackdropPath: string | null;
    tmdbFirstAirDate: string | null;
    tmdbGenres: TmdbGenreDto[] | null;
    tmdbTvSeriesId: number;
    tmdbLastAirDate: string | null;
    tmdbName: string | null;
    tmdbNumberOfEpisodes: number;
    tmdbNumberOfSeasons: number;
    tmdbOverview: string | null;
    tmdbPosterPath: string | null;
    tmdbSeasons: TmdbSeasonDto[] | null;
    tmdbStatus: string | null;
}
export interface TmdbSearchResultDto extends MediaEntryExternalSearchResultDto {
    name: string | null;
    overview: string | null;
    releaseDate: string | null;
    genreIds: number[];
}
//# sourceMappingURL=metadata.d.ts.map