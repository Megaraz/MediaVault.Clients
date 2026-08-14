import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';
import {
  OperationType,
  Result,
  Error as ResultErrorFactory,
  ResultOf,
} from 'result-pattern-typescript/legacy';
import type { BookEntry } from '../../models/BookEntry';
import type { GameEntry } from '../../models/GameEntry';
import type { MangaEntry } from '../../models/MangaEntry';
import type { MovieEntry } from '../../models/MovieEntry';
import { Rating } from '../../models/Rating';
import type { Season } from '../../models/Season';
import type { TvSeriesEntry } from '../../models/TvSeriesEntry';
import { getOfflineDatabase } from '../SQLite';
import {
  cancelled,
  errorContext,
  isOperationCancelled,
  isUniqueConstraintError,
  notFound,
  queryFailure,
  saveFailure,
  saveFailureResult,
} from './repoHelpers';

export type MediaEntryEntity = BookEntry | GameEntry | MangaEntry | MovieEntry | TvSeriesEntry;

interface MediaEntryRow {
  Id: string;
  OwnerId: string;
  IdExternal: string | null;
  Status: number;
  Title: string;
  Rating: number;
  Review: string | null;
  Genres: string;
  Overview: string | null;
  ReleaseDate: string | null;
  ImageUrl: string | null;
  MediaType: number;
  CreatedAtUtc: string;
  UpdatedAtUtc: string;
  BookEntry_Author: string | null;
  MetacriticRating: number | null;
  Website: string | null;
  Platforms: string | null;
  HoursPlayed: number | null;
  PcRequirements_Minimum: string | null;
  PcRequirements_Recommended: string | null;
  PcRequirements_High: string | null;
  PcRequirements_VeryHigh: string | null;
  PcRequirements_Ultra: string | null;
  Author: string | null;
  RuntimeMinutes: number | null;
  BackdropImageUrl: string | null;
  LastAirDate: string | null;
  NumberOfSeasons: number | null;
  NumberOfEpisodes: number | null;
  AiringStatus: string | null;
  TotalWatchedEpisodes: number | null;
}

interface SeasonRow {
  Id: string;
  TvSeriesEntryId: string;
  IdExternal: string | null;
  Name: string | null;
  Overview: string | null;
  ImageUrl: string | null;
  SeasonNumber: number;
  AirDate: string | null;
  WatchedEpisodes: number;
  Episodes: number;
  Status: number;
  Rating: number;
  CreatedAtUtc: string;
  UpdatedAtUtc: string;
}

export class MediaEntryRepo {
  public async createAsync(entity: MediaEntryEntity): Promise<ResultOf<MediaEntryEntity>> {
    const context = errorContext(this.constructor.name, 'createAsync', OperationType.Create, 'MediaEntry');

    try {
      const db = await getOfflineDatabase();
      const now = new Date().toISOString();
      const created = { ...entity, createdAtUtc: now, updatedAtUtc: now };

      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO "MediaEntries" (
          "Id", "OwnerId", "IdExternal", "Status", "Title", "Rating", "Review",
          "Genres", "Overview", "ReleaseDate", "ImageUrl", "MediaType",
          "CreatedAtUtc", "UpdatedAtUtc", "BookEntry_Author", "MetacriticRating",
          "Website", "Platforms", "HoursPlayed", "PcRequirements_Minimum",
          "PcRequirements_Recommended", "PcRequirements_High", "PcRequirements_VeryHigh",
          "PcRequirements_Ultra", "Author", "RuntimeMinutes", "BackdropImageUrl",
          "LastAirDate", "NumberOfSeasons", "NumberOfEpisodes", "AiringStatus",
          "TotalWatchedEpisodes"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ...mediaValues(created),
        );
        if (isTvSeries(created)) {
          await mergeSeasons(db, created.id, created.seasons);
        }
      });

      return ResultOf.success(created);
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      if (isUniqueConstraintError(exception)) {
        return ResultOf.failure(ResultErrorFactory.conflict(context));
      }
      return saveFailure(context, exception);
    }
  }

  public async getCollectionByOwnerIdAsync(
    ownerId: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<ResultOf<readonly MediaEntryEntity[]>> {
    const context = errorContext(
      this.constructor.name,
      'getCollectionByOwnerIdAsync',
      OperationType.GetCollection,
      'MediaEntry',
    );

    try {
      const db = await getOfflineDatabase();
      const rows = await db.getAllAsync<MediaEntryRow>(
        'SELECT * FROM "MediaEntries" WHERE "OwnerId" = ? ORDER BY "CreatedAtUtc" LIMIT ? OFFSET ?',
        ownerId,
        pageSize,
        Math.max(0, pageNumber - 1) * pageSize,
      );
      return ResultOf.success(rows.map((row) => mapMediaEntry(row)));
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      return queryFailure(context, exception);
    }
  }

  public async getByIdAsync(
    ownerId: string,
    entityId: string,
  ): Promise<ResultOf<MediaEntryEntity>> {
    const context = errorContext(this.constructor.name, 'getByIdAsync', OperationType.Get, 'MediaEntry');

    try {
      const db = await getOfflineDatabase();
      const row = await db.getFirstAsync<MediaEntryRow>(
        'SELECT * FROM "MediaEntries" WHERE "Id" = ? AND "OwnerId" = ?',
        entityId,
        ownerId,
      );
      if (!row) return notFound(context);

      const entity = mapMediaEntry(row);
      if (isTvSeries(entity)) {
        entity.seasons = await readSeasons(db, entity.id);
        for (const season of entity.seasons) {
          season.tvSeriesEntry = entity;
        }
      }
      return ResultOf.success(entity);
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      return queryFailure(context, exception);
    }
  }

  public async updateAsync(ownerId: string, updatedEntity: MediaEntryEntity): Promise<Result> {
    const context = errorContext(this.constructor.name, 'updateAsync', OperationType.Update, 'MediaEntry');

    try {
      const db = await getOfflineDatabase();
      const existing = await db.getFirstAsync<MediaEntryRow>(
        'SELECT * FROM "MediaEntries" WHERE "Id" = ? AND "OwnerId" = ?',
        updatedEntity.id,
        ownerId,
      );
      if (!existing) return Result.failure(ResultErrorFactory.notFound(context));

      await db.withTransactionAsync(async () => {
        await updateMediaEntry(db, ownerId, updatedEntity, existing.CreatedAtUtc);
        if (isTvSeries(updatedEntity)) {
          await mergeSeasons(db, updatedEntity.id, updatedEntity.seasons);
        }
      });
      return Result.success();
    } catch (exception) {
      if (isOperationCancelled(exception)) return Result.failure(ResultErrorFactory.cancelled(context));
      return saveFailureResult(context, exception);
    }
  }

  public async deleteAsync(ownerId: string, entityId: string): Promise<Result> {
    const context = errorContext(this.constructor.name, 'deleteAsync', OperationType.Delete, 'MediaEntry');

    try {
      const db = await getOfflineDatabase();
      const result = await db.runAsync(
        'DELETE FROM "MediaEntries" WHERE "Id" = ? AND "OwnerId" = ?',
        entityId,
        ownerId,
      );
      if (result.changes === 0) return Result.failure(ResultErrorFactory.notFound(context));
      return Result.success();
    } catch (exception) {
      if (isOperationCancelled(exception)) return Result.failure(ResultErrorFactory.cancelled(context));
      return saveFailureResult(context, exception);
    }
  }

  public async searchMediaEntriesAsync(
    ownerId: string,
    query: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<ResultOf<readonly MediaEntryEntity[]>> {
    const context = errorContext(
      this.constructor.name,
      'searchMediaEntriesAsync',
      OperationType.GetCollection,
      'MediaEntry',
    );

    try {
      const db = await getOfflineDatabase();
      const rows = await db.getAllAsync<MediaEntryRow>(
        `SELECT * FROM "MediaEntries"
         WHERE "OwnerId" = ? AND instr(lower("Title"), lower(?)) > 0
         ORDER BY "CreatedAtUtc" LIMIT ? OFFSET ?`,
        ownerId,
        query,
        pageSize,
        Math.max(0, pageNumber - 1) * pageSize,
      );
      return ResultOf.success(rows.map((row) => mapMediaEntry(row)));
    } catch (exception) {
      if (isOperationCancelled(exception)) return cancelled(context);
      return queryFailure(context, exception);
    }
  }
}

function mediaValues(entity: MediaEntryEntity): SQLiteBindValue[] {
  const game = isGame(entity) ? entity : undefined;
  const tv = isTvSeries(entity) ? entity : undefined;
  const author = isBook(entity) || isManga(entity) ? entity.author : null;
  return [
    entity.id, entity.ownerId, entity.idExternal, entity.status, entity.title, entity.rating.value,
    entity.review, JSON.stringify(entity.genres), entity.overview, entity.releaseDate, entity.imageUrl,
    entity.mediaType, entity.createdAtUtc, entity.updatedAtUtc, isBook(entity) ? author : null, game?.metacriticRating ?? null,
    game?.website ?? null, game ? JSON.stringify(game.platforms) : null, game?.hoursPlayed ?? null,
    game?.pcRequirements?.minimum ?? null, game?.pcRequirements?.recommended ?? null,
    game?.pcRequirements?.high ?? null, game?.pcRequirements?.veryHigh ?? null, game?.pcRequirements?.ultra ?? null,
    isManga(entity) ? author : null,
    isMovie(entity) ? entity.runtimeMinutes : null, tv?.backdropImageUrl ?? null,
    tv?.lastAirDate ?? null, tv?.numberOfSeasons ?? null, tv?.numberOfEpisodes ?? null,
    tv?.airingStatus ?? null, tv?.totalWatchedEpisodes ?? null,
  ];
}

async function updateMediaEntry(
  db: SQLiteDatabase,
  ownerId: string,
  entity: MediaEntryEntity,
  createdAtUtc: string,
): Promise<void> {
  const values = mediaValues({ ...entity, ownerId, createdAtUtc, updatedAtUtc: new Date().toISOString() });
  const columns = [
    'IdExternal', 'Status', 'Title', 'Rating', 'Review', 'Genres', 'Overview', 'ReleaseDate',
    'ImageUrl', 'MediaType', 'UpdatedAtUtc', 'BookEntry_Author', 'MetacriticRating', 'Website',
    'Platforms', 'HoursPlayed', 'PcRequirements_Minimum', 'PcRequirements_Recommended',
    'PcRequirements_High', 'PcRequirements_VeryHigh', 'PcRequirements_Ultra', 'Author',
    'RuntimeMinutes', 'BackdropImageUrl', 'LastAirDate', 'NumberOfSeasons', 'NumberOfEpisodes',
    'AiringStatus', 'TotalWatchedEpisodes',
  ];
  await db.runAsync(
    `UPDATE "MediaEntries" SET ${columns.map((column) => `"${column}" = ?`).join(', ')}
     WHERE "Id" = ? AND "OwnerId" = ?`,
    ...values.slice(2, 12),
    ...values.slice(13),
    entity.id,
    ownerId,
  );
}

async function mergeSeasons(db: SQLiteDatabase, tvSeriesEntryId: string, updatedSeasons: Season[]): Promise<void> {
  const existing = await db.getAllAsync<SeasonRow>(
    'SELECT * FROM "Seasons" WHERE "TvSeriesEntryId" = ?',
    tvSeriesEntryId,
  );
  const incomingNumbers = new Set(updatedSeasons.map((season) => season.seasonNumber));

  for (const season of existing) {
    if (!incomingNumbers.has(season.SeasonNumber)) {
      await db.runAsync('DELETE FROM "Seasons" WHERE "Id" = ?', season.Id);
    }
  }

  for (const season of updatedSeasons) {
    const current = existing.find((item) => item.SeasonNumber === season.seasonNumber);
    const now = new Date().toISOString();
    if (current) {
      await db.runAsync(
        `UPDATE "Seasons" SET "IdExternal" = ?, "Name" = ?, "Overview" = ?, "ImageUrl" = ?,
         "AirDate" = ?, "WatchedEpisodes" = ?, "Episodes" = ?, "Status" = ?, "Rating" = ?, "UpdatedAtUtc" = ?
         WHERE "Id" = ?`,
        season.idExternal, season.name, season.overview, season.imageUrl, season.airDate, season.watchedEpisodes,
        season.episodes, season.status, season.rating.value, now, current.Id,
      );
    } else {
      await db.runAsync(
        `INSERT INTO "Seasons" (
          "Id", "TvSeriesEntryId", "IdExternal", "Name", "Overview", "ImageUrl", "SeasonNumber",
          "AirDate", "WatchedEpisodes", "Episodes", "Status", "Rating", "CreatedAtUtc", "UpdatedAtUtc"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        createUuid(), tvSeriesEntryId, season.idExternal, season.name, season.overview, season.imageUrl,
        season.seasonNumber, season.airDate, season.watchedEpisodes, season.episodes, season.status,
        season.rating.value, now, now,
      );
    }
  }
}

async function readSeasons(db: SQLiteDatabase, tvSeriesEntryId: string): Promise<Season[]> {
  const rows = await db.getAllAsync<SeasonRow>(
    'SELECT * FROM "Seasons" WHERE "TvSeriesEntryId" = ? ORDER BY "SeasonNumber"',
    tvSeriesEntryId,
  );
  return rows.map((row) => ({
    id: row.Id,
    tvSeriesEntryId: row.TvSeriesEntryId,
    tvSeriesEntry: undefined as never,
    idExternal: row.IdExternal,
    name: row.Name,
    overview: row.Overview,
    imageUrl: row.ImageUrl,
    seasonNumber: row.SeasonNumber,
    airDate: row.AirDate,
    watchedEpisodes: row.WatchedEpisodes,
    episodes: row.Episodes,
    status: row.Status,
    rating: new Rating(row.Rating),
    createdAtUtc: row.CreatedAtUtc,
    updatedAtUtc: row.UpdatedAtUtc,
  }));
}

function mapMediaEntry(row: MediaEntryRow): MediaEntryEntity {
  const base = {
    id: row.Id,
    ownerId: row.OwnerId,
    idExternal: row.IdExternal,
    status: row.Status,
    title: row.Title,
    rating: new Rating(row.Rating),
    review: row.Review,
    genres: parseJson<string[]>(row.Genres, []),
    overview: row.Overview,
    releaseDate: row.ReleaseDate,
    imageUrl: row.ImageUrl,
    mediaType: row.MediaType,
    createdAtUtc: row.CreatedAtUtc,
    updatedAtUtc: row.UpdatedAtUtc,
  };
  switch (row.MediaType) {
    case 0: return { ...base, runtimeMinutes: row.RuntimeMinutes ?? 0 };
    case 1: return {
      ...base, backdropImageUrl: row.BackdropImageUrl, lastAirDate: row.LastAirDate,
      numberOfSeasons: row.NumberOfSeasons ?? 0, numberOfEpisodes: row.NumberOfEpisodes ?? 0,
      airingStatus: row.AiringStatus, totalWatchedEpisodes: row.TotalWatchedEpisodes ?? 0, seasons: [],
    };
    case 2: return { ...base, author: row.BookEntry_Author ?? row.Author ?? null };
    case 3: return { ...base, author: row.Author ?? null };
    case 4: return {
      ...base, metacriticRating: row.MetacriticRating ?? 0, website: row.Website,
      platforms: parseJson<string[]>(row.Platforms, []), hoursPlayed: row.HoursPlayed ?? 0,
      pcRequirements: row.PcRequirements_Minimum === null && row.PcRequirements_Recommended === null &&
        row.PcRequirements_High === null && row.PcRequirements_VeryHigh === null && row.PcRequirements_Ultra === null
        ? null
        : {
          minimum: row.PcRequirements_Minimum, recommended: row.PcRequirements_Recommended,
          high: row.PcRequirements_High, veryHigh: row.PcRequirements_VeryHigh, ultra: row.PcRequirements_Ultra,
        },
    };
    default: return base as MediaEntryEntity;
  }
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (value === null) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (exception) {
    throw new Error(`Invalid JSON stored in the offline database: ${String(exception)}`);
  }
}

function isGame(entity: MediaEntryEntity): entity is GameEntry { return entity.mediaType === 4; }
function isTvSeries(entity: MediaEntryEntity): entity is TvSeriesEntry { return entity.mediaType === 1; }
function isMovie(entity: MediaEntryEntity): entity is MovieEntry { return entity.mediaType === 0; }
function isBook(entity: MediaEntryEntity): entity is BookEntry { return entity.mediaType === 2; }
function isManga(entity: MediaEntryEntity): entity is MangaEntry { return entity.mediaType === 3; }

function createUuid(): string {
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
