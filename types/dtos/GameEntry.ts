import type { MediaEntryDetailedDto, MediaEntryCreateDto, MediaEntryUpdateDto } from './MediaEntryBase';

export interface GameEntryDetailedDto extends MediaEntryDetailedDto {
  hoursPlayed: number;
  metacriticRating: number;
  website: string | null;
  platforms: string[] | null;
}

export interface GameEntryCreateDto extends MediaEntryCreateDto {
  hoursPlayed: number;
  metacriticRating?: number;
  website?: string;
  platforms?: string[];
}

export interface GameEntryUpdateDto extends MediaEntryUpdateDto {
  hoursPlayed: number;
  metacriticRating?: number;
  website?: string;
  platforms?: string[];
}
