import type { BookEntryCreateDto, BookEntryDetailedDto, BookEntryUpdateDto } from '@mediavault/contracts';
import { apiFetch } from '../shared/apiFetch';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class BookEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/books`;

  async createBook(dto: BookEntryCreateDto): Promise<BookEntryDetailedDto> {
    const response = await apiFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to create book entry: ' + errorMessage);
    }
    return response.json();
  }

  async updateBook(id: string, dto: BookEntryUpdateDto): Promise<void> {
    const response = await apiFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to update book entry: ' + errorMessage);
    }
  }
}
