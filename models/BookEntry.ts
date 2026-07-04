import type { IHasAuthor } from './IHasAuthor';
import type { MediaEntry } from './MediaEntry';

export interface BookEntry extends MediaEntry, IHasAuthor {}
