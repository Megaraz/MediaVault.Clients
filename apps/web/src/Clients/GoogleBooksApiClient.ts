import type {
    GoogleBooksDetailedDto,
    SearchRequestDto,
} from "@mediavault/contracts";
import {
    googleBookByIdOperation,
    mapGoogleBookMetadata,
    searchGoogleBooksOperation,
} from "@mediavault/client-core";
import { executeWebOperation } from "./apiFetch";

// The search dropdown uses a web-local view model rather than the provider DTO.
export type GoogleBooksSearchResult = {
    idExternal: string;
    title: string;
    coverImageUrl: string | null;
    author: string;
};

export default class GoogleBooksApiClient {
    async searchBooks(
        request: SearchRequestDto,
        page: number = 1,
        pageSize: number = 8,
        signal?: AbortSignal,
    ): Promise<GoogleBooksSearchResult[]> {
        const books = await executeWebOperation(searchGoogleBooksOperation(request, page, pageSize), signal);
        return books.map((book) => {
            const metadata = mapGoogleBookMetadata(book);
            return {
                idExternal: metadata.externalId,
                title: metadata.title,
                coverImageUrl: metadata.imageUrl,
                author: metadata.author,
            };
        });
    }

    async getBookById(volumeId: string, signal?: AbortSignal): Promise<GoogleBooksDetailedDto> {
        return executeWebOperation(googleBookByIdOperation(volumeId), signal);
    }
}
