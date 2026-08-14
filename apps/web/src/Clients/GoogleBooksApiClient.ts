import type {
    GoogleBooksDetailedDto,
    SearchRequestDto,
} from "@mediavault/contracts";
import { apiFetch } from "./apiFetch";

// Google Books' API contract uses externalId. The web search dropdown uses a
// local idExternal view-model field shared with the other provider adapters.
export type GoogleBooksSearchResult = {
    idExternal: string;
    title: string;
    coverImageUrl: string | null;
    author: string;
};

export default class GoogleBooksApiClient {
    private baseUrl = "/googlebooksapi";

    async searchBooks(
        request: SearchRequestDto,
        page: number = 1,
        pageSize: number = 8
    ): Promise<GoogleBooksSearchResult[]> {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("pageSize", pageSize.toString());

        const response = await apiFetch(`${this.baseUrl}/search?${params}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to search books: " + errorMessage);
        }

        const books = (await response.json()) as GoogleBooksDetailedDto[];
        return books.map((book) => ({
            idExternal: book.externalId,
            title: book.title,
            coverImageUrl: book.coverImageUrl,
            author: book.author,
        }));
    }

    async getBookById(volumeId: string): Promise<GoogleBooksDetailedDto> {
        const response = await apiFetch(`${this.baseUrl}/${volumeId}`);

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to fetch book: " + errorMessage);
        }

        return response.json();
    }
}
