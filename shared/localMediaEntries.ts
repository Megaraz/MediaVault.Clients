import {
  Result,
  ResultOf,
} from 'result-pattern-typescript';
import type { MediaEntryDetailedDto, MediaEntryMinimalDto } from '../types/dtos/MediaEntryBase';
import { MediaEntryRepo } from '../database/repos/MediaEntryRepo';
import {
  MediaEntryDtoMapper,
  type CreateDto,
  type UpdateDto,
} from '../mappers/MediaEntry/MediaEntryDtoMapper';
import {
  MediaEntryEntityMapper,
} from '../mappers/MediaEntry/MediaEntryEntityMapper';
import { getOfflineUserId } from './tokenStore';

const repo = new MediaEntryRepo();
const dtoMapper = new MediaEntryDtoMapper();
const entityMapper = new MediaEntryEntityMapper();

export async function localGetMediaEntries(page = 1, pageSize = 25): Promise<MediaEntryMinimalDto[]> {
  const ownerId = await requireOfflineUserId();
  return entityMapper.toMinimalDtoCollection(
    await unwrap(repo.getCollectionByOwnerIdAsync(ownerId, page, pageSize)),
  );
}

export async function localSearchMediaEntries(
  query: string,
  page = 1,
  pageSize = 10,
): Promise<MediaEntryMinimalDto[]> {
  const ownerId = await requireOfflineUserId();
  return entityMapper.toMinimalDtoCollection(
    await unwrap(repo.searchMediaEntriesAsync(ownerId, query, page, pageSize)),
  );
}

export async function localGetMediaEntryById(entryId: string): Promise<MediaEntryDetailedDto> {
  const ownerId = await requireOfflineUserId();
  return entityMapper.toDetailedDto(await unwrap(repo.getByIdAsync(ownerId, entryId)));
}

export async function localDeleteMediaEntry(entryId: string): Promise<void> {
  const ownerId = await requireOfflineUserId();
  await unwrapResult(repo.deleteAsync(ownerId, entryId));
}

export async function localCreateMediaEntry(
  mediaType: number,
  dto: CreateDto,
): Promise<MediaEntryDetailedDto> {
  const ownerId = await requireOfflineUserId();
  const entity = dtoMapper.toEntity(dto, ownerId, mediaType);
  const created = await unwrap(repo.createAsync(entity));
  return localGetMediaEntryById(created.id);
}

export async function localUpdateMediaEntry(
  mediaType: number,
  entryId: string,
  dto: UpdateDto,
): Promise<void> {
  const ownerId = await requireOfflineUserId();
  await unwrapResult(repo.updateAsync(
    ownerId,
    dtoMapper.toEntityFromUpdate(entryId, dto, ownerId, mediaType),
  ));
}

async function requireOfflineUserId(): Promise<string> {
  const userId = await getOfflineUserId();
  if (!userId) {
    throw new Error('You must be logged in to access local media entries.');
  }
  return userId;
}

async function unwrap<T>(resultPromise: Promise<ResultOf<T>>): Promise<T> {
  const result = await resultPromise;
  if (!result.isSuccess) {
    throw new Error(result.message || 'Local database operation failed.');
  }
  return result.value;
}

async function unwrapResult(resultPromise: Promise<Result>): Promise<void> {
  const result = await resultPromise;
  if (!result.isSuccess) {
    throw new Error(result.message || 'Local database operation failed.');
  }
}
