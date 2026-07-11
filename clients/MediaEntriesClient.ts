import type { BookEntryDetailedDto } from '../types/dtos/BookEntry';
import type { GameEntryDetailedDto } from '../types/dtos/GameEntry';
import type { MangaEntryDetailedDto } from '../types/dtos/MangaEntry';
import type {
  MediaEntryDetailedDto,
  MediaEntryMinimalDto,
  MediaEntrySearchRequestDto,
} from '../types/dtos/MediaEntryBase';
import type { MovieEntryDetailedDto } from '../types/dtos/MovieEntry';
import type { TvSeriesEntryDetailedDto } from '../types/dtos/TvSeriesEntry';
import { apiFetch } from '../shared/apiFetch';
import { featureFlags } from '../shared/featureFlags';
import {
  localDeleteMediaEntry,
  localGetMediaEntries,
  localGetMediaEntryById,
  localSearchMediaEntries,
} from '../shared/localMediaEntries';

export { MediaType, MediaTypeLabels, StatusLabels, StatusType } from '../types/dtos/MediaEntryBase';
export type {
  MediaEntryCreateDto, MediaEntryDetailedDto,
  MediaEntryMinimalDto,
  MediaEntrySearchRequestDto, MediaEntryUpdateDto
} from '../types/dtos/MediaEntryBase';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class MediaEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries`;

  async searchMediaEntries(
    request: MediaEntrySearchRequestDto,
    page: number = 1,
    pageSize: number = 10
  ): Promise<MediaEntryMinimalDto[]> {
    if (featureFlags.useClientDatabase) {
      return localSearchMediaEntries(request.query, page, pageSize);
    }

    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());

    const response = await apiFetch(`${this.baseUrl}/search?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to search media entries: ' + errorMessage);
    }

    return response.json();
  }

  async getMediaEntries(pageNumber = 1, pageSize = 25): Promise<MediaEntryMinimalDto[]> {
    if (featureFlags.useClientDatabase) {
      return localGetMediaEntries(pageNumber, pageSize);
    }

    const response = await apiFetch(
      `${this.baseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entries: ' + errorMessage);
    }
    return response.json();
  }

  async getMangaById(entryId: string): Promise<MangaEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localGetMediaEntryById(entryId) as Promise<MangaEntryDetailedDto>;
    }

    const response = await apiFetch(`${this.baseUrl}/manga/${entryId}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getTvSeriesById(entryId: string): Promise<TvSeriesEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localGetMediaEntryById(entryId) as Promise<TvSeriesEntryDetailedDto>;
    }

    const response = await apiFetch(`${this.baseUrl}/tv-series/${entryId}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getMovieById(entryId: string): Promise<MovieEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localGetMediaEntryById(entryId) as Promise<MovieEntryDetailedDto>;
    }

    const response = await apiFetch(`${this.baseUrl}/movies/${entryId}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getGameById(entryId: string): Promise<GameEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localGetMediaEntryById(entryId) as Promise<GameEntryDetailedDto>;
    }

    const response = await apiFetch(`${this.baseUrl}/games/${entryId}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getBookById(entryId: string): Promise<BookEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localGetMediaEntryById(entryId) as Promise<BookEntryDetailedDto>;
    }

    const response = await apiFetch(`${this.baseUrl}/books/${entryId}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getMediaEntryById(entryId: string): Promise<MediaEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localGetMediaEntryById(entryId);
    }

    const response = await apiFetch(`${this.baseUrl}/${entryId}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async deleteMediaEntry(entryId: string): Promise<void> {
    if (featureFlags.useClientDatabase) {
      return localDeleteMediaEntry(entryId);
    }

    const response = await apiFetch(`${this.baseUrl}/${entryId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to delete media entry: ' + errorMessage);
    }
  }
}
