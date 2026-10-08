/*
  Warnings:

  - You are about to drop the column `durationSeconds` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `endsAt` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `Quiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "durationSeconds",
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "startsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "endsAt",
DROP COLUMN "startsAt";
