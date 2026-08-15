import { MediaType, type MovieEntryCreateDto, type MovieEntryDetailedDto, type MovieEntryUpdateDto } from '@mediavault/contracts';
import { createMediaEntryOperation, updateMediaEntryOperation, validateMediaEntry } from '@mediavault/client-core';
import { executeMobileOperation, throwOnFailure } from '../shared/apiFetch';

export default class MovieEntriesClient {
  async createMovie(dto: MovieEntryCreateDto, signal?: AbortSignal): Promise<MovieEntryDetailedDto> {
    throwOnFailure(validateMediaEntry(dto));
    return executeMobileOperation(createMediaEntryOperation(MediaType.Movie, dto), signal);
  }

  async updateMovie(id: string, dto: MovieEntryUpdateDto, signal?: AbortSignal): Promise<void> {
    throwOnFailure(validateMediaEntry(dto));
    await executeMobileOperation(updateMediaEntryOperation(MediaType.Movie, id, dto), signal);
  }
}
