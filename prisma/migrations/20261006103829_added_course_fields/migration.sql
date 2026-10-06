/*
  Warnings:

  - You are about to drop the column `testField` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "testField",
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "hocheTime" JSONB,
ADD COLUMN     "parisTime" JSONB,
ADD COLUMN     "rating" TEXT,
ADD COLUMN     "tagLine" TEXT,
ADD COLUMN     "targetAudience" JSONB;
