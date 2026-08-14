import {
    MediaType,
    type GameEntryCreateDto,
    type GameEntryDetailedDto,
    type GameEntryUpdateDto,
} from "@mediavault/contracts";
import {
    createMediaEntryOperation,
    updateMediaEntryOperation,
    validateMediaEntry,
} from "@mediavault/client-core";
import { executeWebOperation, throwOnFailure } from "./apiFetch";

export default class GameEntriesClient {
    async createGame(dto: GameEntryCreateDto, signal?: AbortSignal): Promise<GameEntryDetailedDto> {
        throwOnFailure(validateMediaEntry(dto));
        return executeWebOperation(createMediaEntryOperation(MediaType.Game, dto), signal);
    }

    async updateGame(id: string, dto: GameEntryUpdateDto, signal?: AbortSignal): Promise<void> {
        throwOnFailure(validateMediaEntry(dto));
        await executeWebOperation(updateMediaEntryOperation(MediaType.Game, id, dto), signal);
    }
}
