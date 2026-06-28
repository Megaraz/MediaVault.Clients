import type { MangaEntryCreateDto, MangaEntryDetailedDto, MangaEntryUpdateDto } from '../types/dtos/MangaEntry';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default class MangaEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/manga`;

  async createManga(dto: MangaEntryCreateDto): Promise<MangaEntryDetailedDto> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to create manga entry: ' + errorMessage);
    }
    return response.json();
  }

  async updateManga(id: string, dto: MangaEntryUpdateDto): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to update manga entry: ' + errorMessage);
    }
  }
}
