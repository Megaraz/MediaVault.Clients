import { MediaType, Status, type MovieEntryCreateDto } from '@mediavault/contracts';
import type { Result } from 'result-pattern-typescript';
import {
  createMediaEntryOperation,
  executeOperation,
  type ClientCapabilities,
  type MovieMetadata,
} from '../src/index.js';

const dto = {
  status: Status.Backlog,
  title: 'Example',
  rating: 0,
  runtimeMinutes: 120,
} satisfies MovieEntryCreateDto;

const operation = createMediaEntryOperation(MediaType.Movie, dto);
const capabilities = undefined as unknown as ClientCapabilities;
const result: Promise<Result<import('@mediavault/contracts').MovieEntryDetailedDto>> =
  executeOperation(operation, capabilities);
const metadata = undefined as unknown as MovieMetadata;

void [result, metadata];
