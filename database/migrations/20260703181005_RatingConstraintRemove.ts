import type { AppDbMigration } from './types';

const migration: AppDbMigration = {
  id: '20260703181005_RatingConstraintRemove',
  productVersion: '10.0.9',
  async up(db) {
    // SQLite cannot drop a CHECK constraint, so rebuild the affected tables.
    await db.execAsync(`
      ALTER TABLE "Seasons" RENAME TO "__old_Seasons";
      ALTER TABLE "MediaEntries" RENAME TO "__old_MediaEntries";

      CREATE TABLE "MediaEntries" (
        "Id" TEXT NOT NULL CONSTRAINT "PK_MediaEntries" PRIMARY KEY,
        "OwnerId" TEXT NOT NULL,
        "IdExternal" TEXT,
        "Status" INTEGER NOT NULL,
        "Title" TEXT NOT NULL,
        "Rating" TEXT NOT NULL,
        "Review" TEXT,
        "Genres" TEXT NOT NULL,
        "Overview" TEXT,
        "ReleaseDate" TEXT,
        "ImageUrl" TEXT,
        "MediaType" INTEGER NOT NULL,
        "CreatedAtUtc" TEXT NOT NULL,
        "UpdatedAtUtc" TEXT NOT NULL,
        "BookEntry_Author" TEXT,
        "MetacriticRating" INTEGER,
        "Website" TEXT,
        "Platforms" TEXT,
        "HoursPlayed" INTEGER,
        "PcRequirements_Discriminator" TEXT,
        "PcRequirements_High" TEXT,
        "PcRequirements_Minimum" TEXT,
        "PcRequirements_Recommended" TEXT,
        "PcRequirements_Ultra" TEXT,
        "PcRequirements_VeryHigh" TEXT,
        "Author" TEXT,
        "RuntimeMinutes" INTEGER,
        "BackdropImageUrl" TEXT,
        "LastAirDate" TEXT,
        "NumberOfSeasons" INTEGER,
        "NumberOfEpisodes" INTEGER,
        "AiringStatus" TEXT,
        "TotalWatchedEpisodes" INTEGER,
        CONSTRAINT "FK_MediaEntries_Users_OwnerId"
          FOREIGN KEY ("OwnerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
      );

      INSERT INTO "MediaEntries"
      SELECT * FROM "__old_MediaEntries";

      CREATE TABLE "Seasons" (
        "Id" TEXT NOT NULL CONSTRAINT "PK_Seasons" PRIMARY KEY,
        "TvSeriesEntryId" TEXT NOT NULL,
        "IdExternal" TEXT,
        "Name" TEXT,
        "Overview" TEXT,
        "ImageUrl" TEXT,
        "SeasonNumber" INTEGER NOT NULL,
        "AirDate" TEXT,
        "WatchedEpisodes" INTEGER NOT NULL,
        "Episodes" INTEGER NOT NULL,
        "Status" INTEGER NOT NULL,
        "Rating" TEXT NOT NULL,
        "CreatedAtUtc" TEXT NOT NULL,
        "UpdatedAtUtc" TEXT NOT NULL,
        CONSTRAINT "FK_Seasons_MediaEntries_TvSeriesEntryId"
          FOREIGN KEY ("TvSeriesEntryId") REFERENCES "MediaEntries" ("Id") ON DELETE CASCADE
      );

      INSERT INTO "Seasons"
      SELECT * FROM "__old_Seasons";

      DROP TABLE "__old_Seasons";
      DROP TABLE "__old_MediaEntries";

      CREATE INDEX "IX_MediaEntries_OwnerId" ON "MediaEntries" ("OwnerId");
      CREATE INDEX "IX_Seasons_TvSeriesEntryId" ON "Seasons" ("TvSeriesEntryId");
    `);
  },
};

export default migration;
