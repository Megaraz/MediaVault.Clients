import type {
  RawgGameDetailedDto,
  RawgSearchResultDto,
  SearchRequestDto,
} from '@mediavault/contracts';
import { rawgGameByIdOperation, searchRawgGamesOperation } from '@mediavault/client-core';
import { executeMobileOperation } from '../shared/apiFetch';

export default class RawgApiClient {
  async searchGames(
    request: SearchRequestDto,
    page = 1,
    pageSize = 8,
    signal?: AbortSignal,
  ): Promise<RawgSearchResultDto[]> {
    return executeMobileOperation(searchRawgGamesOperation(request, page, pageSize), signal);
  }

  async getGameById(id: number, signal?: AbortSignal): Promise<RawgGameDetailedDto> {
    return executeMobileOperation(rawgGameByIdOperation(id), signal);
  }
}
