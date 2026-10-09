/*
  Warnings:

  - You are about to drop the column `courseId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the `FAQ` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FAQ" DROP CONSTRAINT "FAQ_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_courseId_fkey";

-- DropIndex
DROP INDEX "Schedule_courseId_idx";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "faqs" JSONB,
ADD COLUMN     "hocheScheduleId" TEXT,
ADD COLUMN     "parisScheduleId" TEXT;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "courseId";

-- DropTable
DROP TABLE "FAQ";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_parisScheduleId_fkey" FOREIGN KEY ("parisScheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_hocheScheduleId_fkey" FOREIGN KEY ("hocheScheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
