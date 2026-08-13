import type { GamePcRequirements } from './GamePcRequirements';
import type { MediaEntry } from './MediaEntry';

export interface GameEntry extends MediaEntry {
  metacriticRating: number;
  website: string | null;
  platforms: string[];
  pcRequirements: GamePcRequirements | null;
  hoursPlayed: number;
}
