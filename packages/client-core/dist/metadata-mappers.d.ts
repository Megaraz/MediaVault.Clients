import { MediaType, type GoogleBooksDetailedDto, type RawgGameDetailedDto, type TmdbMovieDetailedDto, type TmdbTvSeriesDetailedDto } from '@mediavault/contracts';
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
export declare function mapTmdbMovieMetadata(dto: TmdbMovieDetailedDto): MovieMetadata;
export declare function mapTmdbTvSeriesMetadata(dto: TmdbTvSeriesDetailedDto): TvSeriesMetadata;
export declare function mapRawgGameMetadata(dto: RawgGameDetailedDto): GameMetadata;
export declare function mapGoogleBookMetadata(dto: GoogleBooksDetailedDto): BookMetadata;
//# sourceMappingURL=metadata-mappers.d.ts.map