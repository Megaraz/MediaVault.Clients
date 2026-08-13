import { apiFetch } from '../shared/apiFetch';
import type { MediaEntrySearchResultDto } from '../types/dtos/MediaEntryBase';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export interface GoogleBooksDetailedDto extends MediaEntrySearchResultDto {
  author: string;
}

export default class GoogleBooksApiClient {
  private baseUrl = `${API_BASE_URL}/googlebooksapi`;

  async searchBooks(query: string, page = 1, pageSize = 8): Promise<GoogleBooksDetailedDto[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const response = await apiFetch(`${this.baseUrl}/search?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Failed to search books: ' + await response.text());
    return response.json();
  }

  async getBookById(volumeId: string): Promise<GoogleBooksDetailedDto> {
    const response = await apiFetch(`${this.baseUrl}/${volumeId}`);
    if (!response.ok) throw new Error('Failed to fetch book: ' + await response.text());
    return response.json();
  }
}
