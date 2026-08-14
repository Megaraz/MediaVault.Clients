import {
  MediaType,
  type GoogleBooksDetailedDto,
  type RawgGameDetailedDto,
  type TmdbMovieDetailedDto,
  type TmdbTvSeriesDetailedDto,
} from '@mediavault/contracts';

export interface SeasonMetadata {
  readonly seasonNumber: number;
  readonly name: string | null;
  readonly overview: string | null;
  readonly imageUrl: string | null;
  readonly airDate: string | null;
  readonly episodes: number;
}

export interface MovieMetadata {
  readonly mediaType: typeof MediaType.Movie;
  readonly externalId: string;
  readonly title: string | null;
  readonly overview: string | null;
  readonly imageUrl: string | null;
  readonly backdropImageUrl: string | null;
  readonly releaseDate: string | null;
  readonly genres: readonly string[];
  readonly runtimeMinutes: number;
}

export interface TvSeriesMetadata {
  readonly mediaType: typeof MediaType.TvSeries;
  readonly externalId: string;
  readonly title: string | null;
  readonly overview: string | null;
  readonly imageUrl: string | null;
  readonly backdropImageUrl: string | null;
  readonly releaseDate: string | null;
  readonly lastAirDate: string | null;
  readonly genres: readonly string[];
  readonly numberOfEpisodes: number;
  readonly numberOfSeasons: number;
  readonly airingStatus: string | null;
  readonly seasons: readonly SeasonMetadata[];
}

export interface GameMetadata {
  readonly mediaType: typeof MediaType.Game;
  readonly externalId: string;
  readonly title: string | null;
  readonly overview: string | null;
  readonly imageUrl: string | null;
  readonly releaseDate: string | null;
  readonly metacriticRating: number;
  readonly platforms: readonly string[];
  readonly website: string | null;
}

export interface BookMetadata {
  readonly mediaType: typeof MediaType.Book;
  readonly externalId: string;
  readonly title: string;
  readonly imageUrl: string | null;
  readonly author: string;
}

export function mapTmdbMovieMetadata(dto: TmdbMovieDetailedDto): MovieMetadata {
  return Object.freeze({
    mediaType: MediaType.Movie,
    externalId: String(dto.tmdbMovieId),
    title: dto.tmdbTitle,
    overview: dto.tmdbOverview,
    imageUrl: dto.tmdbPosterPath,
    backdropImageUrl: dto.tmdbBackdropPath,
    releaseDate: dto.tmdbReleaseDate,
    genres: freezeStrings(dto.tmdbGenres.map((genre) => genre.tmdbGenreName)),
    runtimeMinutes: dto.tmdbRunTimeMinutes,
  });
}

export function mapTmdbTvSeriesMetadata(dto: TmdbTvSeriesDetailedDto): TvSeriesMetadata {
  return Object.freeze({
    mediaType: MediaType.TvSeries,
    externalId: String(dto.tmdbTvSeriesId),
    title: dto.tmdbName,
    overview: dto.tmdbOverview,
    imageUrl: dto.tmdbPosterPath,
    backdropImageUrl: dto.tmdbBackdropPath,
    releaseDate: dto.tmdbFirstAirDate,
    lastAirDate: dto.tmdbLastAirDate,
    genres: freezeStrings((dto.tmdbGenres ?? []).map((genre) => genre.tmdbGenreName)),
    numberOfEpisodes: dto.tmdbNumberOfEpisodes,
    numberOfSeasons: dto.tmdbNumberOfSeasons,
    airingStatus: dto.tmdbStatus,
    seasons: Object.freeze((dto.tmdbSeasons ?? []).map((season) => Object.freeze({
      seasonNumber: season.tmdbSeasonNumber,
      name: season.tmdbName,
      overview: season.tmdbOverview,
      imageUrl: season.tmdbPosterPath,
      airDate: season.tmdbAirDate,
      episodes: season.tmdbEpisodeCount,
    }))),
  });
}

export function mapRawgGameMetadata(dto: RawgGameDetailedDto): GameMetadata {
  return Object.freeze({
    mediaType: MediaType.Game,
    externalId: String(dto.rawgId),
    title: dto.rawgName,
    overview: dto.rawgDescription,
    imageUrl: dto.rawgBackgroundImage,
    releaseDate: dto.rawgReleased,
    metacriticRating: dto.rawgMetacritic,
    platforms: Object.freeze([...dto.rawgPlatforms]),
    website: dto.rawgWebsite,
  });
}

export function mapGoogleBookMetadata(dto: GoogleBooksDetailedDto): BookMetadata {
  return Object.freeze({
    mediaType: MediaType.Book,
    externalId: dto.externalId,
    title: dto.title,
    imageUrl: dto.coverImageUrl,
    author: dto.author,
  });
}

function freezeStrings(values: readonly (string | null)[]): readonly string[] {
  return Object.freeze(values.filter((value): value is string => value !== null && value.trim().length > 0));
}
