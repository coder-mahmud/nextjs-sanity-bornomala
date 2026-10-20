-- CreateEnum
CREATE TYPE "StudentLocation" AS ENUM ('PARIS', 'HOCHE', 'ONLINE');

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "studentId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "subscriptionDate" TIMESTAMP(3),
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentDates" TIMESTAMP(3)[],
    "due" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "location" "StudentLocation" NOT NULL DEFAULT 'ONLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyExpense" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "income" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delfA1" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delfA2" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delfB1" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delfB2" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pdf" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "mixedIncome" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "mixedExpenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Student_inventoryId_idx" ON "Student"("inventoryId");

-- CreateIndex
CREATE INDEX "DailyExpense_branchId_idx" ON "DailyExpense"("branchId");

-- CreateIndex
CREATE INDEX "DailyExpense_date_idx" ON "DailyExpense"("date");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpense" ADD CONSTRAINT "DailyExpense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
