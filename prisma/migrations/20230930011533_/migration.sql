-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "res_assistance_dif" BIGINT NOT NULL DEFAULT 0,
    "gather_dif" BIGINT NOT NULL DEFAULT 0,
    "help_dif" BIGINT NOT NULL DEFAULT 0,
    "date_scan" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    CONSTRAINT "governor_kpi_governor_id_fkey" FOREIGN KEY ("governor_id") REFERENCES "governor" ("governor_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_governor_kpi" ("created_at", "date_scan", "dead_dif", "gather_dif", "governor_id", "help_dif", "id", "power_dif", "t1_kill_dif", "t2_kill_dif", "t3_kill_dif", "t4_kill_dif", "t5_kill_dif", "updated_at") SELECT "created_at", "date_scan", "dead_dif", "gather_dif", "governor_id", "help_dif", "id", "power_dif", "t1_kill_dif", "t2_kill_dif", "t3_kill_dif", "t4_kill_dif", "t5_kill_dif", "updated_at" FROM "governor_kpi";
DROP TABLE "governor_kpi";
ALTER TABLE "new_governor_kpi" RENAME TO "governor_kpi";
CREATE UNIQUE INDEX "governor_kpi_governor_id_key" ON "governor_kpi"("governor_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
