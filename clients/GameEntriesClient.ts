import type { GameEntryCreateDto, GameEntryDetailedDto, GameEntryUpdateDto } from '../types/dtos/GameEntry';
import { apiFetch } from '../shared/apiFetch';
import { featureFlags } from '../shared/featureFlags';
import { localCreateMediaEntry, localUpdateMediaEntry } from '../shared/localMediaEntries';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class GameEntriesClient {
  private baseUrl = `${API_BASE_URL}/mediaentries/games`;

  async createGame(dto: GameEntryCreateDto): Promise<GameEntryDetailedDto> {
    if (featureFlags.useClientDatabase) {
      return localCreateMediaEntry(4, dto) as Promise<GameEntryDetailedDto>;
    }

    const response = await apiFetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to create game entry: ' + errorMessage);
    }
    return response.json();
  }

  async updateGame(id: string, dto: GameEntryUpdateDto): Promise<void> {
    if (featureFlags.useClientDatabase) {
      return localUpdateMediaEntry(4, id, dto);
    }

    const response = await apiFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error('Failed to update game entry: ' + errorMessage);
    }
  }
}
