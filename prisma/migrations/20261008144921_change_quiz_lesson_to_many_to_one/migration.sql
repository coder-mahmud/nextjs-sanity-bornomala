/*
  Warnings:

  - You are about to drop the column `lessonId` on the `Quiz` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_lessonId_fkey";

-- DropIndex
DROP INDEX "Quiz_lessonId_key";

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "quizId" TEXT;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "lessonId";

-- CreateIndex
CREATE INDEX "Lesson_quizId_idx" ON "Lesson"("quizId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
