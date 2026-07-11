import type { BookEntryCreateDto, BookEntryDetailedDto, BookEntryUpdateDto } from '../types/dtos/BookEntry';
import { apiFetch } from '../shared/apiFetch';
import { featureFlags } from '../shared/featureFlags';
import { localCreateMediaEntry, localUpdateMediaEntry } from '../shared/localMediaEntries';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class BookEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/books`;

  async createBook(dto: BookEntryCreateDto): Promise<BookEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localCreateMediaEntry(2, dto) as Promise<BookEntryDetailedDto>;
    }

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
    if (featureFlags.useClientDatabase) {
      return localUpdateMediaEntry(2, id, dto);
    }

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
