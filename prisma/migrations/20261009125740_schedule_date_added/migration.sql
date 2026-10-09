/*
  Warnings:

  - Added the required column `startDate` to the `ScheduleEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduleEntry" ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ScheduleEntry_startDate_idx" ON "ScheduleEntry"("startDate");
