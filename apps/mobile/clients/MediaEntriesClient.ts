import type {
  BookEntryDetailedDto,
  GameEntryDetailedDto,
  MangaEntryDetailedDto,
  MediaEntryDetailedDto,
  MediaEntryMinimalDto,
  SearchRequestDto,
  MovieEntryDetailedDto,
  TvSeriesEntryDetailedDto,
} from '@mediavault/contracts';
import { MediaType } from '@mediavault/contracts';
import {
  deleteMediaEntryOperation,
  mediaEntriesOperation,
  mediaEntryByIdOperation,
  searchMediaEntriesOperation,
  type ApiOperation,
} from '@mediavault/client-core';
import { executeMobileOperation } from '../shared/apiFetch';

export default class MediaEntriesClient {
  async searchMediaEntries(
    request: SearchRequestDto,
    page: number = 1,
    pageSize: number = 10,
    signal?: AbortSignal,
  ): Promise<MediaEntryMinimalDto[]> {
    return executeMobileOperation(searchMediaEntriesOperation(request, page, pageSize), signal);
  }

  async getMediaEntries(pageNumber = 1, pageSize = 25, signal?: AbortSignal): Promise<MediaEntryMinimalDto[]> {
    return executeMobileOperation(mediaEntriesOperation(pageNumber, pageSize), signal);
  }

  async getMangaById(entryId: string, signal?: AbortSignal): Promise<MangaEntryDetailedDto> {
    return executeMobileOperation(mediaEntryByIdOperation(MediaType.Manga, entryId), signal);
  }

  async getTvSeriesById(entryId: string, signal?: AbortSignal): Promise<TvSeriesEntryDetailedDto> {
    return executeMobileOperation(mediaEntryByIdOperation(MediaType.TvSeries, entryId), signal);
  }

  async getMovieById(entryId: string, signal?: AbortSignal): Promise<MovieEntryDetailedDto> {
    return executeMobileOperation(mediaEntryByIdOperation(MediaType.Movie, entryId), signal);
  }

  async getGameById(entryId: string, signal?: AbortSignal): Promise<GameEntryDetailedDto> {
    return executeMobileOperation(mediaEntryByIdOperation(MediaType.Game, entryId), signal);
  }

  async getBookById(entryId: string, signal?: AbortSignal): Promise<BookEntryDetailedDto> {
    return executeMobileOperation(mediaEntryByIdOperation(MediaType.Book, entryId), signal);
  }

  async getMediaEntryById(entryId: string, signal?: AbortSignal): Promise<MediaEntryDetailedDto> {
    return executeMobileOperation(mediaEntryByUnknownTypeOperation(entryId), signal);
  }

  async deleteMediaEntry(entryId: string, signal?: AbortSignal): Promise<void> {
    await executeMobileOperation(deleteMediaEntryOperation(entryId), signal);
  }
}

// The generic detail endpoint cannot select a type-specific core operation.
// Keep this service-facing adapter local until the core exposes a verified
// generic detail factory; execution and safe error mapping remain shared.
function mediaEntryByUnknownTypeOperation(entryId: string): ApiOperation<MediaEntryDetailedDto> {
  return Object.freeze({
    method: 'GET',
    path: `/mediaentries/${encodeURIComponent(entryId)}`,
    responseKind: 'json',
    requiresAuthentication: true,
  });
}
