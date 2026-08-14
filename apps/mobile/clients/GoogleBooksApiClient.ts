import { apiFetch } from '../shared/apiFetch';
import type { GoogleBooksDetailedDto, SearchRequestDto } from '@mediavault/contracts';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

// Google Books uses externalId in the API contract. The mobile search UI uses
// the local idExternal field shared by its other provider adapters.
export type GoogleBooksSearchResult = {
  idExternal: string;
  title: string;
  coverImageUrl: string | null;
  author: string;
};

export default class GoogleBooksApiClient {
  private baseUrl = `${API_BASE_URL}/googlebooksapi`;

  async searchBooks(
    request: SearchRequestDto,
    page = 1,
    pageSize = 8,
  ): Promise<GoogleBooksSearchResult[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const response = await apiFetch(`${this.baseUrl}/search?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to search books: ' + await response.text());
    const books = (await response.json()) as GoogleBooksDetailedDto[];
    return books.map((book) => ({
      idExternal: book.externalId,
      title: book.title,
      coverImageUrl: book.coverImageUrl,
      author: book.author,
    }));
  }

  async getBookById(volumeId: string): Promise<GoogleBooksDetailedDto> {
    const response = await apiFetch(`${this.baseUrl}/${volumeId}`);
    if (!response.ok) throw new Error('Failed to fetch book: ' + await response.text());
    return response.json();
  }
}
