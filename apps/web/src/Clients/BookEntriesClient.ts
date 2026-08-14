import {
    MediaType,
    type BookEntryCreateDto,
    type BookEntryDetailedDto,
    type BookEntryUpdateDto,
} from "@mediavault/contracts";
import {
    createMediaEntryOperation,
    updateMediaEntryOperation,
    validateMediaEntry,
} from "@mediavault/client-core";
import { executeWebOperation, throwOnFailure } from "./apiFetch";

export default class BookEntriesClient {
    async createBook(dto: BookEntryCreateDto, signal?: AbortSignal): Promise<BookEntryDetailedDto> {
        throwOnFailure(validateMediaEntry(dto));
        return executeWebOperation(createMediaEntryOperation(MediaType.Book, dto), signal);
    }

    async updateBook(id: string, dto: BookEntryUpdateDto, signal?: AbortSignal): Promise<void> {
        throwOnFailure(validateMediaEntry(dto));
        await executeWebOperation(updateMediaEntryOperation(MediaType.Book, id, dto), signal);
    }
}
