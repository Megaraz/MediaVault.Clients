import {
    MediaType,
    type MangaEntryCreateDto,
    type MangaEntryDetailedDto,
    type MangaEntryUpdateDto,
} from "@mediavault/contracts";
import {
    createMediaEntryOperation,
    updateMediaEntryOperation,
    validateMediaEntry,
} from "@mediavault/client-core";
import { executeWebOperation, throwOnFailure } from "./apiFetch";

export default class MangaEntriesClient {
    async createManga(dto: MangaEntryCreateDto, signal?: AbortSignal): Promise<MangaEntryDetailedDto> {
        throwOnFailure(validateMediaEntry(dto));
        return executeWebOperation(createMediaEntryOperation(MediaType.Manga, dto), signal);
    }

    async updateManga(id: string, dto: MangaEntryUpdateDto, signal?: AbortSignal): Promise<void> {
        throwOnFailure(validateMediaEntry(dto));
        await executeWebOperation(updateMediaEntryOperation(MediaType.Manga, id, dto), signal);
    }
}
