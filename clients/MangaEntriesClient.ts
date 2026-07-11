import type { MangaEntryCreateDto, MangaEntryDetailedDto, MangaEntryUpdateDto } from '../types/dtos/MangaEntry';
import { apiFetch } from '../shared/apiFetch';
import { featureFlags } from '../shared/featureFlags';
import { localCreateMediaEntry, localUpdateMediaEntry } from '../shared/localMediaEntries';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class MangaEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/manga`;

  async createManga(dto: MangaEntryCreateDto): Promise<MangaEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localCreateMediaEntry(3, dto) as Promise<MangaEntryDetailedDto>;
    }

    const response = await apiFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to create manga entry: ' + errorMessage);
    }
    return response.json();
  }

  async updateManga(id: string, dto: MangaEntryUpdateDto): Promise<void> {
    if (featureFlags.useClientDatabase) {
      return localUpdateMediaEntry(3, id, dto);
    }

    const response = await apiFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to update manga entry: ' + errorMessage);
    }
  }
}
