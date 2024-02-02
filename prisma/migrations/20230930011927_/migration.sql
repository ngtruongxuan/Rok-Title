/*
  Warnings:

  - A unique constraint covering the columns `[governor_id,date_scan]` on the table `governor_tracking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "governor_tracking_governor_id_date_scan_key" ON "governor_tracking"("governor_id", "date_scan");
