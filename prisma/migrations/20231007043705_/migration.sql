-- CreateTable
CREATE TABLE "kpi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kpi_cd" TEXT NOT NULL,
    "power_from" BIGINT NOT NULL,
    "power_to" BIGINT NOT NULL,
    "kp_min" BIGINT NOT NULL,
    "kp_target" BIGINT NOT NULL,
    "power_loss_min" BIGINT NOT NULL,
    "power_loss" BIGINT NOT NULL,
    "dead" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "kpi_kpi_cd_key" ON "kpi"("kpi_cd");
