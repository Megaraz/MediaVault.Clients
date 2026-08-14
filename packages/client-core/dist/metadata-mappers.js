import { MediaType, } from '@mediavault/contracts';
export function mapTmdbMovieMetadata(dto) {
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
export function mapTmdbTvSeriesMetadata(dto) {
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
export function mapRawgGameMetadata(dto) {
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
export function mapGoogleBookMetadata(dto) {
    return Object.freeze({
        mediaType: MediaType.Book,
        externalId: dto.externalId,
        title: dto.title,
        imageUrl: dto.coverImageUrl,
        author: dto.author,
    });
}
function freezeStrings(values) {
    return Object.freeze(values.filter((value) => value !== null && value.trim().length > 0));
}
