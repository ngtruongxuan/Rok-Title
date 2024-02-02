/*
  Warnings:

  - You are about to drop the column `kpi_cd` on the `kpi` table. All the data in the column will be lost.
  - Added the required column `cd` to the `kpi` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_kpi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cd" TEXT NOT NULL,
    "power_from" BIGINT NOT NULL,
    "power_to" BIGINT NOT NULL,
    "kp_min" BIGINT NOT NULL,
    "kp_target" BIGINT NOT NULL,
    "power_loss_min" BIGINT NOT NULL,
    "power_loss" BIGINT NOT NULL,
    "dead" BIGINT NOT NULL
);
INSERT INTO "new_kpi" ("dead", "id", "kp_min", "kp_target", "power_from", "power_loss", "power_loss_min", "power_to") SELECT "dead", "id", "kp_min", "kp_target", "power_from", "power_loss", "power_loss_min", "power_to" FROM "kpi";
DROP TABLE "kpi";
ALTER TABLE "new_kpi" RENAME TO "kpi";
CREATE UNIQUE INDEX "kpi_cd_key" ON "kpi"("cd");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
