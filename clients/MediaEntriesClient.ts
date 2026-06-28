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

export type {
  MediaEntryDetailedDto,
  MediaEntryMinimalDto,
  MediaEntrySearchRequestDto,
  MediaEntryCreateDto,
  MediaEntryUpdateDto,
} from '../types/dtos/MediaEntryBase';
export { StatusLabels, MediaTypeLabels, StatusType, MediaType } from '../types/dtos/MediaEntryBase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default class MediaEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries`;

  async searchMediaEntries(
    request: MediaEntrySearchRequestDto,
    page: number = 1,
    pageSize: number = 10
  ): Promise<MediaEntryMinimalDto[]> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());

    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to search media entries: ' + errorMessage);
    }

    return response.json();
  }

  async getMediaEntries(pageNumber = 1, pageSize = 25): Promise<MediaEntryMinimalDto[]> {
    const response = await fetch(
      `${this.baseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        credentials: 'include',
      }
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entries: ' + errorMessage);
    }
    return response.json();
  }

  async getMangaById(entryId: string): Promise<MangaEntryDetailedDto> {
    const response = await fetch(`${this.baseUrl}/manga/${entryId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getTvSeriesById(entryId: string): Promise<TvSeriesEntryDetailedDto> {
    const response = await fetch(`${this.baseUrl}/tv-series/${entryId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getMovieById(entryId: string): Promise<MovieEntryDetailedDto> {
    const response = await fetch(`${this.baseUrl}/movies/${entryId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getGameById(entryId: string): Promise<GameEntryDetailedDto> {
    const response = await fetch(`${this.baseUrl}/games/${entryId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getBookById(entryId: string): Promise<BookEntryDetailedDto> {
    const response = await fetch(`${this.baseUrl}/books/${entryId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async getMediaEntryById(entryId: string): Promise<MediaEntryDetailedDto> {
    const response = await fetch(`${this.baseUrl}/${entryId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to fetch media entry: ' + errorMessage);
    }
    return response.json();
  }

  async deleteMediaEntry(entryId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${entryId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to delete media entry: ' + errorMessage);
    }
  }
}
