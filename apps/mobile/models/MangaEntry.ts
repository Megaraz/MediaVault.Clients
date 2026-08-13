import type { IHasAuthor } from './IHasAuthor';
import type { MediaEntry } from './MediaEntry';

export interface MangaEntry extends MediaEntry, IHasAuthor {}
