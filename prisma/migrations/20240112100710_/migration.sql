-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_governor_tracking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kingdom" TEXT NOT NULL DEFAULT '',
    "governor_id" TEXT NOT NULL,
    "governor_name" TEXT NOT NULL,
    "alliance_name" TEXT NOT NULL,
    "power" BIGINT NOT NULL DEFAULT 0,
    "kill_point" BIGINT NOT NULL DEFAULT 0,
    "t1_kill" BIGINT NOT NULL DEFAULT 0,
    "t2_kill" BIGINT NOT NULL DEFAULT 0,
    "t3_kill" BIGINT NOT NULL DEFAULT 0,
    "t4_kill" BIGINT NOT NULL DEFAULT 0,
    "t5_kill" BIGINT NOT NULL DEFAULT 0,
    "dead" BIGINT NOT NULL DEFAULT 0,
    "resource_assistance" BIGINT NOT NULL DEFAULT 0,
    "resource_gathered" BIGINT NOT NULL DEFAULT 0,
    "alliance_help" BIGINT NOT NULL DEFAULT 0,
    "date_scan" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);
INSERT INTO "new_governor_tracking" ("alliance_help", "alliance_name", "created_at", "date_scan", "dead", "governor_id", "governor_name", "id", "kill_point", "power", "resource_assistance", "resource_gathered", "t1_kill", "t2_kill", "t3_kill", "t4_kill", "t5_kill", "updated_at") SELECT "alliance_help", "alliance_name", "created_at", "date_scan", "dead", "governor_id", "governor_name", "id", "kill_point", "power", "resource_assistance", "resource_gathered", "t1_kill", "t2_kill", "t3_kill", "t4_kill", "t5_kill", "updated_at" FROM "governor_tracking";
DROP TABLE "governor_tracking";
ALTER TABLE "new_governor_tracking" RENAME TO "governor_tracking";
CREATE UNIQUE INDEX "governor_tracking_id_key" ON "governor_tracking"("id");
CREATE UNIQUE INDEX "governor_tracking_governor_id_date_scan_key" ON "governor_tracking"("governor_id", "date_scan");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
