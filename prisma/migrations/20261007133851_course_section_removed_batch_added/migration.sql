/*
  Warnings:

  - You are about to drop the column `sectionId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the column `lastWatchedAt` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the column `watchedSeconds` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the `CourseSection` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[batchId,order]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lessonId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,quizId]` on the table `QuizAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "CourseSection" DROP CONSTRAINT "CourseSection_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_sectionId_fkey";

-- DropIndex
DROP INDEX "Lesson_sectionId_idx";

-- DropIndex
DROP INDEX "Lesson_sectionId_order_key";

-- DropIndex
DROP INDEX "Payment_userId_courseId_idx";

-- DropIndex
DROP INDEX "Payment_userId_quizId_idx";

-- DropIndex
DROP INDEX "QuizAttempt_userId_quizId_idx";

-- AlterTable
ALTER TABLE "CourseAccess" ADD COLUMN     "batchId" TEXT;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "sectionId",
ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "LessonProgress" DROP COLUMN "completed",
DROP COLUMN "lastWatchedAt",
DROP COLUMN "watchedSeconds",
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "batchId" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'EUR';

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "lessonId" TEXT,
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "startsAt" TIMESTAMP(3),
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "currency" SET DEFAULT 'EUR',
ALTER COLUMN "passingScore" SET DEFAULT 50;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';

-- DropTable
DROP TABLE "CourseSection";

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "meetingPlatform" TEXT,
    "meetingLink" TEXT,
    "meetingPassword" TEXT,
    "maxStudents" INTEGER,
    "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_slug_key" ON "Batch"("slug");

-- CreateIndex
CREATE INDEX "Batch_courseId_idx" ON "Batch"("courseId");

-- CreateIndex
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- CreateIndex
CREATE INDEX "CourseAccess_batchId_idx" ON "CourseAccess"("batchId");

-- CreateIndex
CREATE INDEX "Lesson_batchId_idx" ON "Lesson"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_batchId_order_key" ON "Lesson"("batchId", "order");

-- CreateIndex
CREATE INDEX "Payment_batchId_idx" ON "Payment"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_lessonId_key" ON "Quiz"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttempt_userId_quizId_key" ON "QuizAttempt"("userId", "quizId");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAccess" ADD CONSTRAINT "CourseAccess_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
