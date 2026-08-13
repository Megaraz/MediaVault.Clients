import type { BookEntryDetailedDto } from '../../types/dtos/BookEntry';
import type { GameEntryDetailedDto } from '../../types/dtos/GameEntry';
import type { MangaEntryDetailedDto } from '../../types/dtos/MangaEntry';
import type { MediaEntryMinimalDto } from '../../types/dtos/MediaEntryBase';
import type { MovieEntryDetailedDto } from '../../types/dtos/MovieEntry';
import type { Season as SeasonDto } from '../../types/dtos/Season';
import type { TvSeriesEntryDetailedDto } from '../../types/dtos/TvSeriesEntry';
import type { BookEntry } from '../../models/BookEntry';
import type { GameEntry } from '../../models/GameEntry';
import type { MangaEntry } from '../../models/MangaEntry';
import type { MovieEntry } from '../../models/MovieEntry';
import type { Season } from '../../models/Season';
import type { TvSeriesEntry } from '../../models/TvSeriesEntry';

export type MediaEntryDetailedDtoUnion =
  | MovieEntryDetailedDto
  | TvSeriesEntryDetailedDto
  | GameEntryDetailedDto
  | BookEntryDetailedDto
  | MangaEntryDetailedDto;

export type MediaEntryEntity =
  | MovieEntry
  | TvSeriesEntry
  | GameEntry
  | BookEntry
  | MangaEntry;

export class MediaEntryEntityMapper {
  public toDetailedDto(entity: MediaEntryEntity): MediaEntryDetailedDtoUnion {
    const base = {
      id: entity.id,
      idExternal: entity.idExternal,
      userId: entity.ownerId,
      status: entity.status,
      title: entity.title,
      rating: entity.rating.value,
      review: entity.review,
      genres: entity.genres,
      overview: entity.overview,
      releaseDate: entity.releaseDate,
      imageUrl: entity.imageUrl,
      mediaType: entity.mediaType,
      createdAtUtc: entity.createdAtUtc,
    };

    switch (entity.mediaType) {
      case 0:
        return { ...base, runtimeMinutes: asMovie(entity).runtimeMinutes };
      case 1: {
        const series = asTvSeries(entity);
        return {
          ...base,
          backdropImageUrl: series.backdropImageUrl,
          firstAirDate: series.releaseDate,
          lastAirDate: series.lastAirDate,
          numberOfSeasons: series.numberOfSeasons,
          numberOfEpisodes: series.numberOfEpisodes,
          airingStatus: series.airingStatus,
          totalWatchedEpisodes: series.totalWatchedEpisodes,
          seasons: series.seasons.map(toSeasonDto),
        };
      }
      case 2:
        return { ...base, author: asBook(entity).author };
      case 3:
        return { ...base, author: asManga(entity).author };
      case 4: {
        const game = asGame(entity);
        return {
          ...base,
          hoursPlayed: game.hoursPlayed,
          metacriticRating: game.metacriticRating,
          platforms: game.platforms,
          website: game.website,
          pcRequirements: game.pcRequirements,
        };
      }
      default:
        throw new Error(`Unknown media type: ${entity.mediaType}`);
    }
  }

  public toDetailedDtoCollection(entities: readonly MediaEntryEntity[]): MediaEntryDetailedDtoUnion[] {
    return entities.map((entity) => this.toDetailedDto(entity));
  }

  public toMinimalDto(entity: MediaEntryEntity): MediaEntryMinimalDto {
    return {
      id: entity.id,
      title: entity.title,
      imageUrl: entity.imageUrl,
      rating: entity.rating.value,
      releaseDate: entity.releaseDate,
      genres: entity.genres,
      mediaType: entity.mediaType,
      status: entity.status,
      createdAtUtc: entity.createdAtUtc,
    };
  }

  public toMinimalDtoCollection(entities: readonly MediaEntryEntity[]): MediaEntryMinimalDto[] {
    return entities.map((entity) => this.toMinimalDto(entity));
  }
}

function toSeasonDto(season: Season): SeasonDto {
  return {
    seasonNumber: season.seasonNumber,
    name: season.name,
    overview: season.overview,
    imageUrl: season.imageUrl,
    airDate: season.airDate,
    episodes: season.episodes,
    watchedEpisodes: season.watchedEpisodes,
    status: season.status,
    rating: season.rating.value,
  };
}

function asMovie(entity: MediaEntryEntity): MovieEntry {
  if (!isMovie(entity)) throw new Error(`Invalid movie entity media type: ${entity.mediaType}`);
  return entity;
}

function asTvSeries(entity: MediaEntryEntity): TvSeriesEntry {
  if (!isTvSeries(entity)) throw new Error(`Invalid TV series entity media type: ${entity.mediaType}`);
  return entity;
}

function asBook(entity: MediaEntryEntity): BookEntry {
  if (!isBook(entity)) throw new Error(`Invalid book entity media type: ${entity.mediaType}`);
  return entity;
}

function asManga(entity: MediaEntryEntity): MangaEntry {
  if (!isManga(entity)) throw new Error(`Invalid manga entity media type: ${entity.mediaType}`);
  return entity;
}

function asGame(entity: MediaEntryEntity): GameEntry {
  if (!isGame(entity)) throw new Error(`Invalid game entity media type: ${entity.mediaType}`);
  return entity;
}

function isMovie(entity: MediaEntryEntity): entity is MovieEntry {
  return entity.mediaType === 0 && 'runtimeMinutes' in entity;
}

function isTvSeries(entity: MediaEntryEntity): entity is TvSeriesEntry {
  return entity.mediaType === 1 && 'seasons' in entity;
}

function isBook(entity: MediaEntryEntity): entity is BookEntry {
  return entity.mediaType === 2 && 'author' in entity;
}

function isManga(entity: MediaEntryEntity): entity is MangaEntry {
  return entity.mediaType === 3 && 'author' in entity;
}

function isGame(entity: MediaEntryEntity): entity is GameEntry {
  return entity.mediaType === 4 && 'hoursPlayed' in entity;
}
