import type { MediaEntryDetailedDto, MediaEntryCreateDto, MediaEntryUpdateDto } from './MediaEntryBase';
import type { GamePcRequirementsDto } from './GamePcRequirements';

export interface GameEntryDetailedDto extends MediaEntryDetailedDto {
  hoursPlayed: number;
  metacriticRating: number;
  website: string | null;
  platforms: string[] | null;
  pcRequirements: GamePcRequirementsDto | null;
}

export interface GameEntryCreateDto extends MediaEntryCreateDto {
  hoursPlayed: number;
  metacriticRating?: number;
  website?: string;
  platforms?: string[];
  pcRequirements?: GamePcRequirementsDto | null;
}

export interface GameEntryUpdateDto extends MediaEntryUpdateDto {
  hoursPlayed: number;
  metacriticRating?: number;
  website?: string;
  platforms?: string[];
  pcRequirements?: GamePcRequirementsDto | null;
}
