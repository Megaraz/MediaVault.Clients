import type { AppDbMigration } from './types';

const migration: AppDbMigration = {
  id: '20260703175601_InitialCreate',
  productVersion: '10.0.9',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE "Users" (
        "Id" TEXT NOT NULL CONSTRAINT "PK_Users" PRIMARY KEY,
        "Username" TEXT NOT NULL,
        "Email" TEXT NOT NULL,
        "PasswordHash" TEXT NOT NULL,
        "CreatedAtUtc" TEXT NOT NULL,
        "UpdatedAtUtc" TEXT NOT NULL
      );

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
          FOREIGN KEY ("OwnerId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
        CONSTRAINT "CK_MediaEntry_Rating"
          CHECK ("Rating" >= 0 AND "Rating" <= 5 AND "Rating" * 2 = FLOOR("Rating" * 2))
      );

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
          FOREIGN KEY ("TvSeriesEntryId") REFERENCES "MediaEntries" ("Id") ON DELETE CASCADE,
        CONSTRAINT "CK_Season_Rating"
          CHECK ("Rating" >= 0 AND "Rating" <= 5 AND "Rating" * 2 = FLOOR("Rating" * 2))
      );

      CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
      CREATE UNIQUE INDEX "IX_Users_Username" ON "Users" ("Username");
      CREATE INDEX "IX_MediaEntries_OwnerId" ON "MediaEntries" ("OwnerId");
      CREATE INDEX "IX_Seasons_TvSeriesEntryId" ON "Seasons" ("TvSeriesEntryId");
    `);
  },
};

export default migration;
