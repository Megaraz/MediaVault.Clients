import * as SQLite from 'expo-sqlite';
import { appDbMigrations } from './migrations';

const DATABASE_NAME = 'mediavault.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getOrCreateDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbPromise === null) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  const db = await dbPromise;
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

async function ensureEfMigrationHistoryTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
      "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
      "ProductVersion" TEXT NOT NULL
    );
  `);
}

async function hasMigration(db: SQLite.SQLiteDatabase, migrationId: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(1) AS count FROM "__EFMigrationsHistory" WHERE "MigrationId" = ?;',
    migrationId,
  );

  return (row?.count ?? 0) > 0;
}

async function applyPendingMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  for (const migration of appDbMigrations) {
    if (await hasMigration(db, migration.id)) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync(
        'INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES (?, ?);',
        migration.id,
        migration.productVersion,
      );
    });
  }
}

export async function initializeOfflineDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getOrCreateDatabase();
  await ensureEfMigrationHistoryTable(db);
  await applyPendingMigrations(db);
  return db;
}

export async function getOfflineDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initializeOfflineDatabase();
}