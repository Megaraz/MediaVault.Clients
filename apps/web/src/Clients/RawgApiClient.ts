import type {
    RawgGameDetailedDto,
    RawgSearchResultDto,
    SearchRequestDto,
} from "@mediavault/contracts";
import {
    rawgGameByIdOperation,
    searchRawgGamesOperation,
} from "@mediavault/client-core";
import { executeWebOperation } from "./apiFetch";

export default class RawgApiClient {
    async searchGames(
        request: SearchRequestDto,
        page: number = 1,
        pageSize: number = 10,
        searchPrecise?: boolean,
        searchExact?: boolean,
        ordering?: string,
        signal?: AbortSignal,
    ): Promise<RawgSearchResultDto[]> {
        return executeWebOperation(
            searchRawgGamesOperation(request, page, pageSize, { searchPrecise, searchExact, ordering }),
            signal,
        );
    }

    async getGameById(id: number, signal?: AbortSignal): Promise<RawgGameDetailedDto> {
        return executeWebOperation(rawgGameByIdOperation(id), signal);
    }
}
