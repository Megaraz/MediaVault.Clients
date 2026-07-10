import type { SQLiteDatabase } from 'expo-sqlite';

export interface AppDbMigration {
  id: string;
  productVersion: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}
