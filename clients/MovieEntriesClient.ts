import type { MovieEntryCreateDto, MovieEntryDetailedDto, MovieEntryUpdateDto } from '../types/dtos/MovieEntry';
import { apiFetch } from '../shared/apiFetch';
import { featureFlags } from '../shared/featureFlags';
import { localCreateMediaEntry, localUpdateMediaEntry } from '../shared/localMediaEntries';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class MovieEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/movies`;

  async createMovie(dto: MovieEntryCreateDto): Promise<MovieEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localCreateMediaEntry(0, dto) as Promise<MovieEntryDetailedDto>;
    }

    const response = await apiFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to create movie entry: ' + errorMessage);
    }
    return response.json();
  }

  async updateMovie(id: string, dto: MovieEntryUpdateDto): Promise<void> {
    if (featureFlags.useClientDatabase) {
      return localUpdateMediaEntry(0, id, dto);
    }

    const response = await apiFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to update movie entry: ' + errorMessage);
    }
  }
}
