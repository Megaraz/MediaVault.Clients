import {
  OperationType,
  type ErrorContext,
} from 'result-pattern-typescript';
import BookEntriesClient from '../clients/BookEntriesClient';
import GameEntriesClient from '../clients/GameEntriesClient';
import MangaEntriesClient from '../clients/MangaEntriesClient';
import MediaEntriesClient from '../clients/MediaEntriesClient';
import MovieEntriesClient from '../clients/MovieEntriesClient';
import TvSeriesEntriesClient from '../clients/TvSeriesEntriesClient';
import type { BookEntryCreateDto, BookEntryDetailedDto, BookEntryUpdateDto } from '../types/dtos/BookEntry';
import type { GameEntryCreateDto, GameEntryDetailedDto, GameEntryUpdateDto } from '../types/dtos/GameEntry';
import type { MangaEntryCreateDto, MangaEntryDetailedDto, MangaEntryUpdateDto } from '../types/dtos/MangaEntry';
import type {
  MediaEntryDetailedDto,
  MediaEntryMinimalDto,
} from '../types/dtos/MediaEntryBase';
import type { MovieEntryCreateDto, MovieEntryDetailedDto, MovieEntryUpdateDto } from '../types/dtos/MovieEntry';
import type { TvSeriesEntryCreateDto, TvSeriesEntryDetailedDto, TvSeriesEntryUpdateDto } from '../types/dtos/TvSeriesEntry';
import { MediaType } from '../types/dtos/MediaEntryBase';
import { MediaEntryRepo } from '../database/repos/MediaEntryRepo';
import { UserRepo } from '../database/repos/UserRepo';
import { featureFlags } from '../shared/featureFlags';
import {
  MediaEntryDtoMapper,
  type CreateDto,
  type UpdateDto,
} from '../mappers/MediaEntry/MediaEntryDtoMapper';
import {
  MediaEntryEntityMapper,
  type MediaEntryDetailedDtoUnion,
  type MediaEntryEntity,
} from '../mappers/MediaEntry/MediaEntryEntityMapper';
import { MediaEntryDtoValidator } from '../validators/MediaEntry/MediaEntryDtoValidator';

export type UserId = string;
export type MediaEntryCreateDto = CreateDto;
export type MediaEntryUpdateDto = UpdateDto;
export type MediaEntryDto = MediaEntryDetailedDtoUnion;

export class MediaEntryService {
  private readonly mediaEntryRepository: MediaEntryRepo;
  private readonly userRepository: UserRepo;
  private readonly mediaEntriesClient: MediaEntriesClient;
  private readonly movieEntriesClient: MovieEntriesClient;
  private readonly tvSeriesEntriesClient: TvSeriesEntriesClient;
  private readonly gameEntriesClient: GameEntriesClient;
  private readonly bookEntriesClient: BookEntriesClient;
  private readonly mangaEntriesClient: MangaEntriesClient;

  private readonly mediaEntryEntityMapper = new MediaEntryEntityMapper();
  private readonly mediaEntryDtoMapper = new MediaEntryDtoMapper();
  private readonly mediaEntryDtoValidator = new MediaEntryDtoValidator();

  public constructor(
    mediaEntryRepository = new MediaEntryRepo(),
    userRepository = new UserRepo(),
    mediaEntriesClient = new MediaEntriesClient(),
    movieEntriesClient = new MovieEntriesClient(),
    tvSeriesEntriesClient = new TvSeriesEntriesClient(),
    gameEntriesClient = new GameEntriesClient(),
    bookEntriesClient = new BookEntriesClient(),
    mangaEntriesClient = new MangaEntriesClient(),
  ) {
    this.mediaEntryRepository = mediaEntryRepository;
    this.userRepository = userRepository;
    this.mediaEntriesClient = mediaEntriesClient;
    this.movieEntriesClient = movieEntriesClient;
    this.tvSeriesEntriesClient = tvSeriesEntriesClient;
    this.gameEntriesClient = gameEntriesClient;
    this.bookEntriesClient = bookEntriesClient;
    this.mangaEntriesClient = mangaEntriesClient;
  }

  public async getMinimalByIdAsync(userId: UserId, id: string): Promise<MediaEntryMinimalDto> {
    this.validateIds(userId, id, 'getMinimalByIdAsync', OperationType.Get);
    await this.ensureLocalUserExists(userId);

    if (this.useClientDatabase) {
      const entity = await this.getLocalEntity(userId, id);
      return this.mediaEntryEntityMapper.toMinimalDto(entity);
    }

    return this.toMinimalDto(await this.getDetailedByIdAsync(userId, id));
  }

  public async getDetailedByIdAsync(userId: UserId, id: string): Promise<MediaEntryDto> {
    this.validateIds(userId, id, 'getDetailedByIdAsync', OperationType.Get);
    await this.ensureLocalUserExists(userId);

    if (this.useClientDatabase) {
      return this.mediaEntryEntityMapper.toDetailedDto(await this.getLocalEntity(userId, id));
    }

    return this.mediaEntriesClient.getMediaEntryById(id) as Promise<MediaEntryDto>;
  }

  public async getMovieByIdAsync(userId: UserId, id: string): Promise<MovieEntryDetailedDto> {
    return this.getTypedByIdAsync(userId, id, MediaType.Movie, 'movie');
  }

  public async getTvSeriesByIdAsync(userId: UserId, id: string): Promise<TvSeriesEntryDetailedDto> {
    return this.getTypedByIdAsync(userId, id, MediaType.Series, 'TV series');
  }

  public async getGameByIdAsync(userId: UserId, id: string): Promise<GameEntryDetailedDto> {
    return this.getTypedByIdAsync(userId, id, MediaType.Game, 'game');
  }

  public async getBookByIdAsync(userId: UserId, id: string): Promise<BookEntryDetailedDto> {
    return this.getTypedByIdAsync(userId, id, MediaType.Book, 'book');
  }

  public async getMangaByIdAsync(userId: UserId, id: string): Promise<MangaEntryDetailedDto> {
    return this.getTypedByIdAsync(userId, id, MediaType.Manga, 'manga');
  }

  public async getDetailedCollectionByOwnerIdAsync(
    userId: UserId,
    pageNumber = 1,
    pageSize = 10,
  ): Promise<MediaEntryDto[]> {
    this.validateUserId(userId, 'getDetailedCollectionByOwnerIdAsync', OperationType.GetCollection);
    await this.ensureLocalUserExists(userId);

    const pagination = normalizePagination(pageNumber, pageSize);
    if (this.useClientDatabase) {
      const entities = await this.unwrap(
        this.mediaEntryRepository.getCollectionByOwnerIdAsync(userId, pagination.pageNumber, pagination.pageSize),
      );
      return this.mediaEntryEntityMapper.toDetailedDtoCollection(entities);
    }

    const minimalEntries = await this.mediaEntriesClient.getMediaEntries(
      pagination.pageNumber,
      pagination.pageSize,
    );
    return Promise.all(minimalEntries.map((entry) => this.getDetailedByIdAsync(userId, entry.id)));
  }

  public async getMinimalCollectionByOwnerIdAsync(
    userId: UserId,
    pageNumber = 1,
    pageSize = 10,
  ): Promise<MediaEntryMinimalDto[]> {
    this.validateUserId(userId, 'getMinimalCollectionByOwnerIdAsync', OperationType.GetCollection);
    await this.ensureLocalUserExists(userId);

    const pagination = normalizePagination(pageNumber, pageSize);
    if (this.useClientDatabase) {
      const entities = await this.unwrap(
        this.mediaEntryRepository.getCollectionByOwnerIdAsync(userId, pagination.pageNumber, pagination.pageSize),
      );
      return this.mediaEntryEntityMapper.toMinimalDtoCollection(entities);
    }

    return this.mediaEntriesClient.getMediaEntries(pagination.pageNumber, pagination.pageSize);
  }

  public async searchAsync(
    userId: UserId,
    query: string,
    pageNumber = 1,
    pageSize = 10,
  ): Promise<MediaEntryMinimalDto[]> {
    this.validateUserId(userId, 'searchAsync', OperationType.GetCollection);
    await this.ensureLocalUserExists(userId);

    const pagination = normalizePagination(pageNumber, pageSize);
    const normalizedQuery = query.trim();
    if (!normalizedQuery) throw new Error('A value for the field \'Query\' is required and cannot be null or empty.');

    if (this.useClientDatabase) {
      const entities = await this.unwrap(
        this.mediaEntryRepository.searchMediaEntriesAsync(
          userId,
          normalizedQuery,
          pagination.pageNumber,
          pagination.pageSize,
        ),
      );
      return this.mediaEntryEntityMapper.toMinimalDtoCollection(entities);
    }

    return this.mediaEntriesClient.searchMediaEntries(
      { query: normalizedQuery },
      pagination.pageNumber,
      pagination.pageSize,
    );
  }

  public async createAsync(
    userId: UserId,
    mediaType: number,
    dto: MediaEntryCreateDto,
  ): Promise<MediaEntryDto> {
    this.validateUserId(userId, 'createAsync', OperationType.Create);
    this.validateMediaType(mediaType);
    await this.ensureLocalUserExists(userId);
    this.validateCreateDto(dto, 'createAsync');

    if (this.useClientDatabase) {
      const entity = this.mediaEntryDtoMapper.toEntity(dto, userId, mediaType);
      const created = await this.unwrap(this.mediaEntryRepository.createAsync(entity));
      return this.mediaEntryEntityMapper.toDetailedDto(created);
    }

    return this.createWithApi(mediaType, dto);
  }

  public async updateAsync(
    userId: UserId,
    id: string,
    mediaType: number,
    dto: MediaEntryUpdateDto,
  ): Promise<void> {
    this.validateIds(userId, id, 'updateAsync', OperationType.Update);
    this.validateMediaType(mediaType);
    await this.ensureLocalUserExists(userId);
    this.validateUpdateDto(dto, 'updateAsync');

    if (this.useClientDatabase) {
      const entity = this.mediaEntryDtoMapper.toEntityFromUpdate(id, dto, userId, mediaType);
      await this.unwrapResult(this.mediaEntryRepository.updateAsync(userId, entity));
      return;
    }

    await this.updateWithApi(mediaType, id, dto);
  }

  public async deleteAsync(userId: UserId, id: string): Promise<void> {
    this.validateIds(userId, id, 'deleteAsync', OperationType.Delete);
    await this.ensureLocalUserExists(userId);

    if (this.useClientDatabase) {
      await this.unwrapResult(this.mediaEntryRepository.deleteAsync(userId, id));
      return;
    }

    await this.mediaEntriesClient.deleteMediaEntry(id);
  }

  private get useClientDatabase(): boolean {
    return featureFlags.useClientDatabase;
  }

  private async getLocalEntity(userId: UserId, id: string): Promise<MediaEntryEntity> {
    return this.unwrap(this.mediaEntryRepository.getByIdAsync(userId, id));
  }

  private async getTypedByIdAsync<T extends MediaEntryDto>(
    userId: UserId,
    id: string,
    mediaType: number,
    displayName: string,
  ): Promise<T> {
    const entry = await this.getDetailedByIdAsync(userId, id);
    if (entry.mediaType !== mediaType) {
      throw new Error(`${displayName} entry was not found.`);
    }
    return entry as T;
  }

  private async ensureLocalUserExists(userId: UserId): Promise<void> {
    if (!this.useClientDatabase) return;
    await this.unwrap(this.userRepository.getByIdAsync(userId));
  }

  private createWithApi(mediaType: number, dto: MediaEntryCreateDto): Promise<MediaEntryDto> {
    switch (mediaType) {
      case MediaType.Movie:
        return this.movieEntriesClient.createMovie(dto as MovieEntryCreateDto);
      case MediaType.Series:
        return this.tvSeriesEntriesClient.createTvSeries(dto as TvSeriesEntryCreateDto);
      case MediaType.Game:
        return this.gameEntriesClient.createGame(dto as GameEntryCreateDto);
      case MediaType.Book:
        return this.bookEntriesClient.createBook(dto as BookEntryCreateDto);
      case MediaType.Manga:
        return this.mangaEntriesClient.createManga(dto as MangaEntryCreateDto);
      default:
        throw new Error(`Unknown media type: ${mediaType}`);
    }
  }

  private updateWithApi(
    mediaType: number,
    id: string,
    dto: MediaEntryUpdateDto,
  ): Promise<void> {
    switch (mediaType) {
      case MediaType.Movie:
        return this.movieEntriesClient.updateMovie(id, dto as MovieEntryUpdateDto);
      case MediaType.Series:
        return this.tvSeriesEntriesClient.updateTvSeries(id, dto as TvSeriesEntryUpdateDto);
      case MediaType.Game:
        return this.gameEntriesClient.updateGame(id, dto as GameEntryUpdateDto);
      case MediaType.Book:
        return this.bookEntriesClient.updateBook(id, dto as BookEntryUpdateDto);
      case MediaType.Manga:
        return this.mangaEntriesClient.updateManga(id, dto as MangaEntryUpdateDto);
      default:
        throw new Error(`Unknown media type: ${mediaType}`);
    }
  }

  private validateCreateDto(dto: MediaEntryCreateDto, methodName: string): void {
    const validation = this.mediaEntryDtoValidator.validateCreateDto(dto, this.errorContext(methodName, OperationType.Create));
    if (!validation.isValid) throw new Error(validation.validationErrors[0]?.userMessage ?? 'Invalid media entry.');
  }

  private validateUpdateDto(dto: MediaEntryUpdateDto, methodName: string): void {
    const validation = this.mediaEntryDtoValidator.validateUpdateDto(dto, this.errorContext(methodName, OperationType.Update));
    if (!validation.isValid) throw new Error(validation.validationErrors[0]?.userMessage ?? 'Invalid media entry.');
  }

  private validateUserId(userId: UserId, methodName: string, operation: OperationType): void {
    if (!userId.trim()) throw new Error(this.errorContext(methodName, operation, 'userId').entityName + ' userId is required.');
  }

  private validateIds(userId: UserId, id: string, methodName: string, operation: OperationType): void {
    this.validateUserId(userId, methodName, operation);
    if (!id.trim()) throw new Error('MediaEntry id is required.');
  }

  private validateMediaType(mediaType: number): void {
    if (
      mediaType === MediaType.All ||
      !Object.values(MediaType).includes(mediaType as (typeof MediaType)[keyof typeof MediaType])
    ) {
      throw new Error(`Unknown media type: ${mediaType}`);
    }
  }

  private errorContext(
    methodName: string,
    operation: OperationType,
    fieldName?: string,
  ): ErrorContext {
    return {
      layer: 'Service',
      serviceName: this.constructor.name,
      methodName,
      operation,
      entityName: 'MediaEntry',
      fieldName,
    };
  }

  private toMinimalDto(dto: MediaEntryDetailedDto): MediaEntryMinimalDto {
    return {
      id: dto.id,
      title: dto.title,
      status: dto.status,
      genres: dto.genres,
      releaseDate: dto.releaseDate,
      mediaType: dto.mediaType,
      rating: dto.rating,
      imageUrl: dto.imageUrl,
      createdAtUtc: dto.createdAtUtc,
    };
  }

  private async unwrap<T>(resultPromise: Promise<{ isSuccess: boolean; value: T; message?: string }>): Promise<T> {
    const result = await resultPromise;
    if (!result.isSuccess) throw new Error(result.message || 'Local database operation failed.');
    return result.value;
  }

  private async unwrapResult(resultPromise: Promise<{ isSuccess: boolean; message?: string }>): Promise<void> {
    const result = await resultPromise;
    if (!result.isSuccess) throw new Error(result.message || 'Local database operation failed.');
  }
}

function normalizePagination(pageNumber: number, pageSize: number): { pageNumber: number; pageSize: number } {
  return {
    pageNumber: Number.isFinite(pageNumber) ? Math.max(1, Math.floor(pageNumber)) : 1,
    pageSize: Number.isFinite(pageSize) ? Math.min(100, Math.max(1, Math.floor(pageSize))) : 10,
  };
}
