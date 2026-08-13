import type { MediaEntry } from './MediaEntry';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  mediaEntries: MediaEntry[];
  createdAtUtc: string;
  updatedAtUtc: string;
}
