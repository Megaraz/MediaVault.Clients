import { apiFetch } from '../shared/apiFetch';
import type { MediaEntrySearchResultDto } from '../types/dtos/MediaEntryBase';

export interface RawgGameDetailedDto {
  rawgId: number;
  rawgSlug?: string;
  rawgName?: string;
  rawgDescription?: string;
  rawgMetacritic: number;
  rawgReleased?: string;
  rawgBackgroundImage?: string;
  rawgWebsite?: string;
  rawgPlatforms?: string[];
}

export default class RawgApiClient {
  private baseUrl = '/rawgapi';

  async searchGames(query: string, page = 1, pageSize = 8): Promise<MediaEntrySearchResultDto[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const response = await apiFetch(`${this.baseUrl}/search?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Failed to search games: ' + await response.text());
    return response.json();
  }

  async getGameById(id: number): Promise<RawgGameDetailedDto> {
    const response = await apiFetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch game: ' + await response.text());
    return response.json();
  }
}
