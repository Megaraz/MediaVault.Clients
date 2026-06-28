import type { MovieEntryCreateDto, MovieEntryDetailedDto, MovieEntryUpdateDto } from '../types/dtos/MovieEntry';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default class MovieEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/movies`;

  async createMovie(dto: MovieEntryCreateDto): Promise<MovieEntryDetailedDto> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to create movie entry: ' + errorMessage);
    }
    return response.json();
  }

  async updateMovie(id: string, dto: MovieEntryUpdateDto): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to update movie entry: ' + errorMessage);
    }
  }
}
