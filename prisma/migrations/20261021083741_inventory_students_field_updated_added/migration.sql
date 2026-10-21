/*
  Warnings:

  - You are about to drop the column `discount` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `due` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDates` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "discount",
DROP COLUMN "due",
DROP COLUMN "location",
DROP COLUMN "paidAmount",
DROP COLUMN "paymentDates",
DROP COLUMN "studentId",
DROP COLUMN "totalAmount",
ADD COLUMN     "aRegler" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "deduit" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "identity" TEXT,
ADD COLUMN     "paye" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tarif" DECIMAL(10,2) NOT NULL DEFAULT 0;
