-- CreateTable
CREATE TABLE "governor" (
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
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "governor_kpi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "governor_id" TEXT NOT NULL,
    "power_dif" BIGINT NOT NULL DEFAULT 0,
    "t1_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "t2_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "t3_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "t4_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "t5_kill_dif" BIGINT NOT NULL DEFAULT 0,
    "dead_dif" BIGINT NOT NULL DEFAULT 0,
    "date_scan" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    CONSTRAINT "governor_kpi_governor_id_fkey" FOREIGN KEY ("governor_id") REFERENCES "governor" ("governor_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "governor_link" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discord_user_id" TEXT NOT NULL,
    "governor_id" TEXT NOT NULL,
    "governor_type" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    CONSTRAINT "governor_link_governor_id_fkey" FOREIGN KEY ("governor_id") REFERENCES "governor" ("governor_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "title_conf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "ttl" BIGINT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "title_request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discord_user_id" BIGINT NOT NULL,
    "kingdom" TEXT NOT NULL,
    "x" BIGINT NOT NULL,
    "y" BIGINT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "governor_tracking" (
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
    "date_scan" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "governor_farm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discord_user_id" TEXT NOT NULL,
    "governor_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "farm_name" TEXT NOT NULL,
    "alliance_name" TEXT NOT NULL,
    "power" BIGINT NOT NULL DEFAULT 0,
    "kill_point" BIGINT NOT NULL DEFAULT 0,
    "t1_kill" BIGINT NOT NULL DEFAULT 0,
    "t2_kill" BIGINT NOT NULL DEFAULT 0,
    "t3_kill" BIGINT NOT NULL DEFAULT 0,
    "t4_kill" BIGINT NOT NULL DEFAULT 0,
    "t5_kill" BIGINT NOT NULL DEFAULT 0,
    "t1_dead" BIGINT NOT NULL DEFAULT 0,
    "t2_dead" BIGINT NOT NULL DEFAULT 0,
    "t3_dead" BIGINT NOT NULL DEFAULT 0,
    "t4_dead" BIGINT NOT NULL DEFAULT 0,
    "t5_dead" BIGINT NOT NULL DEFAULT 0,
    "dead" BIGINT NOT NULL DEFAULT 0,
    "resource_assistance" BIGINT NOT NULL DEFAULT 0,
    "date_scan" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "governor_governor_id_key" ON "governor"("governor_id");

-- CreateIndex
CREATE UNIQUE INDEX "governor_kpi_governor_id_key" ON "governor_kpi"("governor_id");

-- CreateIndex
CREATE UNIQUE INDEX "governor_link_discord_user_id_key" ON "governor_link"("discord_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "governor_link_governor_id_key" ON "governor_link"("governor_id");

-- CreateIndex
CREATE UNIQUE INDEX "title_conf_title_key" ON "title_conf"("title");

-- CreateIndex
CREATE UNIQUE INDEX "governor_tracking_id_key" ON "governor_tracking"("id");

-- CreateIndex
CREATE UNIQUE INDEX "governor_farm_id_key" ON "governor_farm"("id");

-- CreateIndex
CREATE UNIQUE INDEX "governor_farm_governor_id_farm_id_key" ON "governor_farm"("governor_id", "farm_id");
