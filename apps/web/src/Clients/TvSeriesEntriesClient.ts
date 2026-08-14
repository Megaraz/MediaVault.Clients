import {
    MediaType,
    type TvSeriesEntryCreateDto,
    type TvSeriesEntryDetailedDto,
    type TvSeriesEntryUpdateDto,
} from "@mediavault/contracts";
import {
    createMediaEntryOperation,
    updateMediaEntryOperation,
    validateMediaEntry,
} from "@mediavault/client-core";
import { executeWebOperation, throwOnFailure } from "./apiFetch";

export default class TvSeriesEntriesClient {
    async createTvSeries(dto: TvSeriesEntryCreateDto, signal?: AbortSignal): Promise<TvSeriesEntryDetailedDto> {
        throwOnFailure(validateMediaEntry(dto));
        return executeWebOperation(createMediaEntryOperation(MediaType.TvSeries, dto), signal);
    }

    async updateTvSeries(id: string, dto: TvSeriesEntryUpdateDto, signal?: AbortSignal): Promise<void> {
        throwOnFailure(validateMediaEntry(dto));
        await executeWebOperation(updateMediaEntryOperation(MediaType.TvSeries, id, dto), signal);
    }
}
