-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_governor_tracking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_governor_tracking" ("alliance_name", "created_at", "date_scan", "dead", "governor_id", "governor_name", "id", "kill_point", "power", "resource_assistance", "t1_kill", "t2_kill", "t3_kill", "t4_kill", "t5_kill", "updated_at") SELECT "alliance_name", "created_at", "date_scan", "dead", "governor_id", "governor_name", "id", "kill_point", "power", "resource_assistance", "t1_kill", "t2_kill", "t3_kill", "t4_kill", "t5_kill", "updated_at" FROM "governor_tracking";
DROP TABLE "governor_tracking";
ALTER TABLE "new_governor_tracking" RENAME TO "governor_tracking";
CREATE UNIQUE INDEX "governor_tracking_id_key" ON "governor_tracking"("id");
CREATE TABLE "new_governor_kpi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "governor_id" TEXT NOT NULL,
    "power_dif" BIGINT NOT NULL DEFAULT 0,
    "t1_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "t2_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "t3_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "t4_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "t5_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "dead_dif" BIGINT NOT NULL DEFAULT 0,
    "gather_dif" BIGINT NOT NULL DEFAULT 0,
    "help_dif" BIGINT NOT NULL DEFAULT 0,
    "date_scan" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    CONSTRAINT "governor_kpi_governor_id_fkey" FOREIGN KEY ("governor_id") REFERENCES "governor" ("governor_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_governor_kpi" ("created_at", "date_scan", "dead_dif", "governor_id", "id", "power_dif", "t1_kill_dif", "t2_kill_dif", "t3_kill_dif", "t4_kill_dif", "t5_kill_dif", "updated_at") SELECT "created_at", "date_scan", "dead_dif", "governor_id", "id", "power_dif", "t1_kill_dif", "t2_kill_dif", "t3_kill_dif", "t4_kill_dif", "t5_kill_dif", "updated_at" FROM "governor_kpi";
DROP TABLE "governor_kpi";
ALTER TABLE "new_governor_kpi" RENAME TO "governor_kpi";
CREATE UNIQUE INDEX "governor_kpi_governor_id_key" ON "governor_kpi"("governor_id");
CREATE TABLE "new_governor" (
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
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);
INSERT INTO "new_governor" ("alliance_name", "created_at", "dead", "governor_id", "governor_name", "id", "kill_point", "kingdom", "power", "resource_assistance", "t1_kill", "t2_kill", "t3_kill", "t4_kill", "t5_kill", "updated_at") SELECT "alliance_name", "created_at", "dead", "governor_id", "governor_name", "id", "kill_point", "kingdom", "power", "resource_assistance", "t1_kill", "t2_kill", "t3_kill", "t4_kill", "t5_kill", "updated_at" FROM "governor";
DROP TABLE "governor";
ALTER TABLE "new_governor" RENAME TO "governor";
CREATE UNIQUE INDEX "governor_governor_id_key" ON "governor"("governor_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
