import * as Crypto from 'expo-crypto';
import type { BookEntryCreateDto, BookEntryDetailedDto, BookEntryUpdateDto } from '../../types/dtos/BookEntry';
import type { GameEntryCreateDto, GameEntryDetailedDto, GameEntryUpdateDto } from '../../types/dtos/GameEntry';
import type { MangaEntryCreateDto, MangaEntryDetailedDto, MangaEntryUpdateDto } from '../../types/dtos/MangaEntry';
import type { MovieEntryCreateDto, MovieEntryDetailedDto, MovieEntryUpdateDto } from '../../types/dtos/MovieEntry';
import type { Season as SeasonDto } from '../../types/dtos/Season';
import type { TvSeriesEntryCreateDto, TvSeriesEntryDetailedDto, TvSeriesEntryUpdateDto } from '../../types/dtos/TvSeriesEntry';
import { Rating } from '../../models/Rating';
import type { Season } from '../../models/Season';
import type { MediaEntryDetailedDtoUnion, MediaEntryEntity } from './MediaEntryEntityMapper';

export type CreateDto =
  | MovieEntryCreateDto
  | TvSeriesEntryCreateDto
  | GameEntryCreateDto
  | BookEntryCreateDto
  | MangaEntryCreateDto;

export type UpdateDto =
  | MovieEntryUpdateDto
  | TvSeriesEntryUpdateDto
  | GameEntryUpdateDto
  | BookEntryUpdateDto
  | MangaEntryUpdateDto;

export class MediaEntryDtoMapper {
  public toEntity(
    dto: CreateDto,
    ownerId: string,
    mediaType: number,
    id?: string,
  ): MediaEntryEntity;
  public toEntity(
    dto: UpdateDto,
    ownerId: string,
    mediaType: number,
    id?: string,
  ): MediaEntryEntity;
  public toEntity(dto: MediaEntryDetailedDtoUnion): MediaEntryEntity;
  public toEntity(
    dto: CreateDto | MediaEntryDetailedDtoUnion,
    ownerId?: string,
    mediaType?: number,
    id?: string,
  ): MediaEntryEntity {
    if (ownerId === undefined || mediaType === undefined) {
      return this.mapDetailedDto(dto as MediaEntryDetailedDtoUnion);
    }

    const now = new Date().toISOString();
    const base = {
      id: id ?? Crypto.randomUUID(),
      ownerId,
      idExternal: dto.idExternal ?? null,
      status: dto.status,
      title: dto.title,
      rating: new Rating(dto.rating),
      review: dto.review ?? null,
      genres: dto.genres ?? [],
      overview: dto.overview ?? null,
      releaseDate: dto.releaseDate ?? null,
      imageUrl: dto.imageUrl ?? null,
      mediaType,
      createdAtUtc: now,
      updatedAtUtc: now,
    };

    switch (mediaType) {
      case 0:
        return { ...base, runtimeMinutes: (dto as MovieEntryCreateDto | MovieEntryUpdateDto).runtimeMinutes };
      case 1: {
        const series = dto as TvSeriesEntryCreateDto | TvSeriesEntryUpdateDto;
        return {
          ...base,
          backdropImageUrl: series.backdropImageUrl ?? null,
          lastAirDate: series.lastAirDate ?? null,
          numberOfSeasons: series.numberOfSeasons,
          numberOfEpisodes: series.numberOfEpisodes,
          airingStatus: series.airingStatus ?? null,
          totalWatchedEpisodes: series.totalWatchedEpisodes,
          seasons: (series.seasons ?? []).map((season) => toSeason(season, base.id, now)),
        };
      }
      case 2:
        return { ...base, author: (dto as BookEntryCreateDto | BookEntryUpdateDto).author ?? null };
      case 3:
        return { ...base, author: (dto as MangaEntryCreateDto | MangaEntryUpdateDto).author ?? null };
      case 4: {
        const game = dto as GameEntryCreateDto | GameEntryUpdateDto;
        return {
          ...base,
          hoursPlayed: game.hoursPlayed,
          metacriticRating: game.metacriticRating ?? 0,
          platforms: game.platforms ?? [],
          website: game.website ?? null,
          pcRequirements: game.pcRequirements ?? null,
        };
      }
      default:
        throw new Error(`Unknown media type: ${mediaType}`);
    }
  }

  public toEntities(dtos: readonly MediaEntryDetailedDtoUnion[]): MediaEntryEntity[] {
    return dtos.map((dto) => this.toEntity(dto));
  }

  public toEntityFromUpdate(
    id: string,
    dto: UpdateDto,
    ownerId: string,
    mediaType: number,
  ): MediaEntryEntity {
    return this.toEntity(dto, ownerId, mediaType, id);
  }

  private mapDetailedDto(dto: MediaEntryDetailedDtoUnion): MediaEntryEntity {
    const base = {
      id: dto.id,
      ownerId: dto.userId,
      idExternal: dto.idExternal,
      status: dto.status,
      title: dto.title,
      rating: new Rating(dto.rating),
      review: dto.review,
      genres: dto.genres ?? [],
      overview: dto.overview,
      releaseDate: dto.releaseDate,
      imageUrl: dto.imageUrl,
      mediaType: dto.mediaType,
      createdAtUtc: dto.createdAtUtc,
      updatedAtUtc: dto.createdAtUtc,
    };

    switch (dto.mediaType) {
      case 0: {
        const movie = dto as MovieEntryDetailedDto;
        return { ...base, runtimeMinutes: movie.runtimeMinutes };
      }
      case 1: {
        const series = dto as TvSeriesEntryDetailedDto;
        return {
          ...base,
          backdropImageUrl: series.backdropImageUrl,
          lastAirDate: series.lastAirDate,
          numberOfSeasons: series.numberOfSeasons,
          numberOfEpisodes: series.numberOfEpisodes,
          airingStatus: series.airingStatus,
          totalWatchedEpisodes: series.totalWatchedEpisodes,
          seasons: (series.seasons ?? []).map((season) => toSeason(season, dto.id, dto.createdAtUtc)),
        };
      }
      case 2:
        return { ...base, author: (dto as BookEntryDetailedDto).author };
      case 3:
        return { ...base, author: (dto as MangaEntryDetailedDto).author };
      case 4: {
        const game = dto as GameEntryDetailedDto;
        return {
          ...base,
          hoursPlayed: game.hoursPlayed,
          metacriticRating: game.metacriticRating,
          platforms: game.platforms ?? [],
          website: game.website,
          pcRequirements: game.pcRequirements ?? null,
        };
      }
      default:
        throw new Error(`Unknown media type: ${dto.mediaType}`);
    }
  }
}

function toSeason(
  input: SeasonDto,
  tvSeriesEntryId: string,
  timestamp: string,
): Season {
  return {
    id: Crypto.randomUUID(),
    tvSeriesEntryId,
    tvSeriesEntry: undefined as never,
    idExternal: null,
    name: input.name,
    overview: input.overview,
    imageUrl: input.imageUrl,
    seasonNumber: input.seasonNumber,
    airDate: input.airDate,
    watchedEpisodes: input.watchedEpisodes,
    episodes: input.episodes,
    status: input.status,
    rating: new Rating(input.rating),
    createdAtUtc: timestamp,
    updatedAtUtc: timestamp,
  };
}
