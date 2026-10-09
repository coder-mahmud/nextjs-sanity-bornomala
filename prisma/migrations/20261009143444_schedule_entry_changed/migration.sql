/*
  Warnings:

  - You are about to drop the column `date` on the `ScheduleEntry` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `ScheduleEntry` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `ScheduleEntry` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `ScheduleEntry` table. All the data in the column will be lost.
  - Added the required column `startingDate` to the `ScheduleEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `ScheduleEntry` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `day` on the `ScheduleEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "ScheduleEntry_date_idx";

-- DropIndex
DROP INDEX "ScheduleEntry_startDate_idx";

-- AlterTable
ALTER TABLE "ScheduleEntry" DROP COLUMN "date",
DROP COLUMN "endTime",
DROP COLUMN "startDate",
DROP COLUMN "startTime",
ADD COLUMN     "startingDate" TEXT NOT NULL,
ADD COLUMN     "time" TEXT NOT NULL,
DROP COLUMN "day",
ADD COLUMN     "day" TEXT NOT NULL;
