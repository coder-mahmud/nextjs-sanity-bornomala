// app/admin/expenses/[id]/page.tsx
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

  const items = [
    { label: "Admission DELF A1", value: expense.admissionDelfA1, comment: expense.admissionDelfA1Comment },
    { label: "Admission DELF A2", value: expense.admissionDelfA2, comment: expense.admissionDelfA2Comment },
    { label: "Admission DELF B1", value: expense.admissionDelfB1, comment: expense.admissionDelfB1Comment },
    { label: "Admission DELF B2", value: expense.admissionDelfB2, comment: expense.admissionDelfB2Comment },
    { label: "DELF Exam", value: expense.delfExam, comment: expense.delfExamComment },
    { label: "PDF", value: expense.pdf, comment: expense.pdfComment },
    { label: "Civique", value: expense.civique, comment: expense.civiqueComment },
  ];

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
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">Financial Items & Comments</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {items.map((item, idx) => (
            <div key={idx} className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">{item.label}</span>
                <span className="text-base font-bold text-gray-900">€{Number(item.value || 0).toLocaleString()}</span>
              </div>
              {item.comment ? (
                <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200 whitespace-pre-wrap">
                  💬 {item.comment}
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 italic">No item comment</p>
              )}
            </div>
          ))}

          {/* Expenses Item Card */}
          <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 uppercase">Expenses</span>
              <span className="text-base font-bold text-rose-700">€{Number(expense.expenses || 0).toLocaleString()}</span>
            </div>
            {expense.expensesComment ? (
              <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-rose-200 whitespace-pre-wrap">
                💬 {expense.expensesComment}
              </p>
            ) : (
              <p className="text-[11px] text-gray-400 italic">No expense comment</p>
            )}
          </div>
        </div>

        {/* Overall General Comment Section */}
        {expense.comment && (
          <div className="pt-4 border-t border-gray-100 space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gray-500" /> Overall Daily Comment / Notes
            </p>
            <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200 whitespace-pre-wrap">
              {expense.comment}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}