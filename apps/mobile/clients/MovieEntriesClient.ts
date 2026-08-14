import type { MovieEntryCreateDto, MovieEntryDetailedDto, MovieEntryUpdateDto } from '@mediavault/contracts';
import { apiFetch } from '../shared/apiFetch';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class MovieEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/movies`;

  async createMovie(dto: MovieEntryCreateDto): Promise<MovieEntryDetailedDto> {
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
