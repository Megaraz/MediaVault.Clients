import type { TvSeriesEntryCreateDto, TvSeriesEntryDetailedDto, TvSeriesEntryUpdateDto } from '../types/dtos/TvSeriesEntry';
import { apiFetch } from '../shared/apiFetch';
import { featureFlags } from '../shared/featureFlags';
import { localCreateMediaEntry, localUpdateMediaEntry } from '../shared/localMediaEntries';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class TvSeriesEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/tv-series`;

  async createTvSeries(dto: TvSeriesEntryCreateDto): Promise<TvSeriesEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localCreateMediaEntry(1, dto) as Promise<TvSeriesEntryDetailedDto>;
    }

    const response = await apiFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to create TV series entry: ' + errorMessage);
    }
    return response.json();
  }

  async updateTvSeries(id: string, dto: TvSeriesEntryUpdateDto): Promise<void> {
    if (featureFlags.useClientDatabase) {
      return localUpdateMediaEntry(1, id, dto);
    }

    const response = await apiFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to update TV series entry: ' + errorMessage);
    }
  }
}
