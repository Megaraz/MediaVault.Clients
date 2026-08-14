import { apiFetch } from '../shared/apiFetch';
import type {
  RawgGameDetailedDto,
  RawgSearchResultDto,
  SearchRequestDto,
} from '@mediavault/contracts';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class RawgApiClient {
  private baseUrl = `${API_BASE_URL}/rawgapi`;

  async searchGames(
    request: SearchRequestDto,
    page = 1,
    pageSize = 8,
  ): Promise<RawgSearchResultDto[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const response = await apiFetch(`${this.baseUrl}/search?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
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
