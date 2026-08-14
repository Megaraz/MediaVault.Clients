import type { TvSeriesEntryCreateDto, TvSeriesEntryDetailedDto, TvSeriesEntryUpdateDto } from '@mediavault/contracts';
import { apiFetch } from '../shared/apiFetch';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class TvSeriesEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/tv-series`;

  async createTvSeries(dto: TvSeriesEntryCreateDto): Promise<TvSeriesEntryDetailedDto> {
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
