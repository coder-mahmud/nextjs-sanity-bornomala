/*
  Warnings:

  - You are about to drop the column `delfA1` on the `DailyExpense` table. All the data in the column will be lost.
  - You are about to drop the column `delfA2` on the `DailyExpense` table. All the data in the column will be lost.
  - You are about to drop the column `delfB1` on the `DailyExpense` table. All the data in the column will be lost.
  - You are about to drop the column `delfB2` on the `DailyExpense` table. All the data in the column will be lost.
  - You are about to drop the column `income` on the `DailyExpense` table. All the data in the column will be lost.
  - You are about to drop the column `mixedExpenses` on the `DailyExpense` table. All the data in the column will be lost.
  - You are about to drop the column `mixedIncome` on the `DailyExpense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyExpense" DROP COLUMN "delfA1",
DROP COLUMN "delfA2",
DROP COLUMN "delfB1",
DROP COLUMN "delfB2",
DROP COLUMN "income",
DROP COLUMN "mixedExpenses",
DROP COLUMN "mixedIncome",
ADD COLUMN     "admissionDelfA1" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "admissionDelfA2" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "admissionDelfB1" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "admissionDelfB2" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "civique" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "delfExam" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "profit" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL DEFAULT 0;
