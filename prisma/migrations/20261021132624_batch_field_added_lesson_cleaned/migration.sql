/*
  Warnings:

  - You are about to drop the column `instructorId` on the `Lesson` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_instructorId_fkey";

-- DropIndex
DROP INDEX "Lesson_instructorId_idx";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "instructorId" TEXT;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "instructorId";

-- CreateIndex
CREATE INDEX "Batch_instructorId_idx" ON "Batch"("instructorId");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
