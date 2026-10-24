// actions/expense.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Sanitizer to convert Prisma Decimals, Dates, and complex objects into plain JSON primitives
function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === "object" && typeof data.toNumber === "function") return data.toNumber();
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(sanitizeData);
  if (typeof data === "object") {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      sanitized[key] = sanitizeData(data[key]);
    }
    return sanitized;
  }
  return data;
}

export async function getBranches() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: sanitizeData(branches) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDailyExpenses() {
  try {
    const expenses = await prisma.dailyExpense.findMany({
      include: { branch: true },
      orderBy: { date: "desc" },
    });
    return { success: true, data: sanitizeData(expenses) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDailyExpenseById(id: string) {
  try {
    const expense = await prisma.dailyExpense.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!expense) return { success: false, error: "Daily Expense record not found" };
    return { success: true, data: sanitizeData(expense) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createDailyExpense(formData: {
  date: string;
  branchId: string;
  admissionDelfA1: number;
  admissionDelfA1Comment?: string;
  admissionDelfA2: number;
  admissionDelfA2Comment?: string;
  admissionDelfB1: number;
  admissionDelfB1Comment?: string;
  admissionDelfB2: number;
  admissionDelfB2Comment?: string;
  delfExam: number;
  delfExamComment?: string;
  pdf: number;
  pdfComment?: string;
  civique: number;
  civiqueComment?: string;
  expenses: number;
  expensesComment?: string;
  comment?: string;
}) {
  try {
    const a1 = Number(formData.admissionDelfA1) || 0;
    const a2 = Number(formData.admissionDelfA2) || 0;
    const b1 = Number(formData.admissionDelfB1) || 0;
    const b2 = Number(formData.admissionDelfB2) || 0;
    const exam = Number(formData.delfExam) || 0;
    const pdf = Number(formData.pdf) || 0;
    const civique = Number(formData.civique) || 0;
    const exp = Number(formData.expenses) || 0;

    // Calculate Total Income & Profit/Loss
    const total = a1 + a2 + b1 + b2 + exam + pdf + civique;
    const profit = total - exp;

    await prisma.dailyExpense.create({
      data: {
        date: new Date(formData.date),
        branchId: formData.branchId,
        admissionDelfA1: a1,
        admissionDelfA1Comment: formData.admissionDelfA1Comment || null,
        admissionDelfA2: a2,
        admissionDelfA2Comment: formData.admissionDelfA2Comment || null,
        admissionDelfB1: b1,
        admissionDelfB1Comment: formData.admissionDelfB1Comment || null,
        admissionDelfB2: b2,
        admissionDelfB2Comment: formData.admissionDelfB2Comment || null,
        delfExam: exam,
        delfExamComment: formData.delfExamComment || null,
        pdf: pdf,
        pdfComment: formData.pdfComment || null,
        civique: civique,
        civiqueComment: formData.civiqueComment || null,
        total: total,
        expenses: exp,
        expensesComment: formData.expensesComment || null,
        profit: profit,
        comment: formData.comment || null,
      },
    });

    revalidatePath("/admin/expenses");
    return { success: true, message: "Daily expense record created successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create daily expense record" };
  }
}

export async function updateDailyExpense(
  id: string,
  formData: {
    date: string;
    branchId: string;
    admissionDelfA1: number;
    admissionDelfA1Comment?: string;
    admissionDelfA2: number;
    admissionDelfA2Comment?: string;
    admissionDelfB1: number;
    admissionDelfB1Comment?: string;
    admissionDelfB2: number;
    admissionDelfB2Comment?: string;
    delfExam: number;
    delfExamComment?: string;
    pdf: number;
    pdfComment?: string;
    civique: number;
    civiqueComment?: string;
    expenses: number;
    expensesComment?: string;
    comment?: string;
  }
) {
  try {
    const a1 = Number(formData.admissionDelfA1) || 0;
    const a2 = Number(formData.admissionDelfA2) || 0;
    const b1 = Number(formData.admissionDelfB1) || 0;
    const b2 = Number(formData.admissionDelfB2) || 0;
    const exam = Number(formData.delfExam) || 0;
    const pdf = Number(formData.pdf) || 0;
    const civique = Number(formData.civique) || 0;
    const exp = Number(formData.expenses) || 0;

    const total = a1 + a2 + b1 + b2 + exam + pdf + civique;
    const profit = total - exp;

    await prisma.dailyExpense.update({
      where: { id },
      data: {
        date: new Date(formData.date),
        branchId: formData.branchId,
        admissionDelfA1: a1,
        admissionDelfA1Comment: formData.admissionDelfA1Comment || null,
        admissionDelfA2: a2,
        admissionDelfA2Comment: formData.admissionDelfA2Comment || null,
        admissionDelfB1: b1,
        admissionDelfB1Comment: formData.admissionDelfB1Comment || null,
        admissionDelfB2: b2,
        admissionDelfB2Comment: formData.admissionDelfB2Comment || null,
        delfExam: exam,
        delfExamComment: formData.delfExamComment || null,
        pdf: pdf,
        pdfComment: formData.pdfComment || null,
        civique: civique,
        civiqueComment: formData.civiqueComment || null,
        total: total,
        expenses: exp,
        expensesComment: formData.expensesComment || null,
        profit: profit,
        comment: formData.comment || null,
      },
    });

    revalidatePath("/admin/expenses");
    return { success: true, message: "Daily expense record updated successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update daily expense record" };
  }
}

export async function deleteDailyExpense(id: string) {
  try {
    await prisma.dailyExpense.delete({ where: { id } });
    revalidatePath("/admin/expenses");
    return { success: true, message: "Daily expense record deleted successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete daily expense record" };
  }
}