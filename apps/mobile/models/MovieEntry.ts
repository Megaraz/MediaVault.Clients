import type { MediaEntry } from './MediaEntry';

export interface MovieEntry extends MediaEntry {
  runtimeMinutes: number;
}
