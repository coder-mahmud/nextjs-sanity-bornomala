"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, TrendingUp, TrendingDown, Pencil, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getDailyExpenseById } from "@/actions/expense";

export default function DailyExpenseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const expenseId = resolvedParams.id;

  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const res = await getDailyExpenseById(expenseId);
      if (res.success) {
        setExpense(res.data);
      } else {
        toast.error(res.error || "Failed to load financial record details");
      }
      setLoading(false);
    }
    fetchDetails();
  }, [expenseId]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-20 text-gray-500">
        Loading financial details...
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Financial record not found.</p>
        <Link
          href="/admin/expenses"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Back to Expenses
        </Link>
      </div>
    );
  }

  const profit = Number(expense.profit) || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/expenses"
            className="p-2 border rounded-lg hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {dayjs(expense.date).format("DD MMMM YYYY")}
              </h1>
              <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {expense.branch?.name || "N/A"}
              </span>
            </div>
            <p className="text-sm text-gray-500">Daily Revenue & Expense Breakdown</p>
          </div>
        </div>

        <Link
          href={`/admin/expenses/${expenseId}/edit`}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          <Pencil className="w-4 h-4" /> Edit Record
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Income</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">€{Number(expense.total).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Expenses</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">€{Number(expense.expenses).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Daily Profit / Loss</p>
            <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              €{profit.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${profit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Detailed Grid Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">Income Source Breakdown</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Admission DELF A1</p>
            <p className="text-lg font-bold text-gray-900 mt-1">€{Number(expense.admissionDelfA1).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Admission DELF A2</p>
            <p className="text-lg font-bold text-gray-900 mt-1">€{Number(expense.admissionDelfA2).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Admission DELF B1</p>
            <p className="text-lg font-bold text-gray-900 mt-1">€{Number(expense.admissionDelfB1).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Admission DELF B2</p>
            <p className="text-lg font-bold text-gray-900 mt-1">€{Number(expense.admissionDelfB2).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">DELF Exam</p>
            <p className="text-lg font-bold text-gray-900 mt-1">€{Number(expense.delfExam).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">PDF</p>
            <p className="text-lg font-bold text-gray-900 mt-1">€{Number(expense.pdf).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Civique</p>
            <p className="text-lg font-bold text-gray-900 mt-1">€{Number(expense.civique).toLocaleString()}</p>
          </div>
        </div>

        {/* Comment Section */}
        {expense.comment && (
          <div className="pt-4 border-t border-gray-100 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Comment / Notes
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {expense.comment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}