import type { GoogleBooksDetailedDto, SearchRequestDto } from '@mediavault/contracts';
import { googleBookByIdOperation, mapGoogleBookMetadata, searchGoogleBooksOperation } from '@mediavault/client-core';
import { executeMobileOperation } from '../shared/apiFetch';

// Google Books uses externalId in the API contract. The mobile search UI uses
// the local idExternal field shared by its other provider adapters.
export type GoogleBooksSearchResult = {
  idExternal: string;
  title: string;
  coverImageUrl: string | null;
  author: string;
};

export default class GoogleBooksApiClient {
  async searchBooks(
    request: SearchRequestDto,
    page = 1,
    pageSize = 8,
    signal?: AbortSignal,
  ): Promise<GoogleBooksSearchResult[]> {
    const books = await executeMobileOperation(searchGoogleBooksOperation(request, page, pageSize), signal);
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
    return executeMobileOperation(googleBookByIdOperation(volumeId), signal);
  }
}
