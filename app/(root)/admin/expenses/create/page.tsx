// app/admin/expenses/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Calendar, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { getBranches, createDailyExpense } from "@/actions/expense";

export default function CreateDailyExpensePage() {
  const router = useRouter();
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [branchId, setBranchId] = useState("");
  
  // Amounts & Comments states
  const [admissionDelfA1, setAdmissionDelfA1] = useState<number | "">(0);
  const [admissionDelfA1Comment, setAdmissionDelfA1Comment] = useState("");

  const [admissionDelfA2, setAdmissionDelfA2] = useState<number | "">(0);
  const [admissionDelfA2Comment, setAdmissionDelfA2Comment] = useState("");

  const [admissionDelfB1, setAdmissionDelfB1] = useState<number | "">(0);
  const [admissionDelfB1Comment, setAdmissionDelfB1Comment] = useState("");

  const [admissionDelfB2, setAdmissionDelfB2] = useState<number | "">(0);
  const [admissionDelfB2Comment, setAdmissionDelfB2Comment] = useState("");

  const [delfExam, setDelfExam] = useState<number | "">(0);
  const [delfExamComment, setDelfExamComment] = useState("");

  const [pdf, setPdf] = useState<number | "">(0);
  const [pdfComment, setPdfComment] = useState("");

  const [civique, setCivique] = useState<number | "">(0);
  const [civiqueComment, setCiviqueComment] = useState("");

  const [expenses, setExpenses] = useState<number | "">(0);
  const [expensesComment, setExpensesComment] = useState("");

  const [comment, setComment] = useState("");

  useEffect(() => {
    async function fetchBranchList() {
      const res = await getBranches();
      if (res.success && res.data) {
        setBranches(res.data);
        if (res.data.length > 0) setBranchId(res.data[0].id);
      } else {
        toast.error("Failed to load locations");
      }
      setLoadingBranches(false);
    }
    fetchBranchList();
  }, []);

  const totalIncome =
    (Number(admissionDelfA1) || 0) +
    (Number(admissionDelfA2) || 0) +
    (Number(admissionDelfB1) || 0) +
    (Number(admissionDelfB2) || 0) +
    (Number(delfExam) || 0) +
    (Number(pdf) || 0) +
    (Number(civique) || 0);

  const profitLoss = totalIncome - (Number(expenses) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saveAction = async () => {
      const res = await createDailyExpense({
        date,
        branchId,
        admissionDelfA1: Number(admissionDelfA1) || 0,
        admissionDelfA1Comment,
        admissionDelfA2: Number(admissionDelfA2) || 0,
        admissionDelfA2Comment,
        admissionDelfB1: Number(admissionDelfB1) || 0,
        admissionDelfB1Comment,
        admissionDelfB2: Number(admissionDelfB2) || 0,
        admissionDelfB2Comment,
        delfExam: Number(delfExam) || 0,
        delfExamComment,
        pdf: Number(pdf) || 0,
        pdfComment,
        civique: Number(civique) || 0,
        civiqueComment,
        expenses: Number(expenses) || 0,
        expensesComment,
        comment,
      });
      if (!res.success) throw new Error(res.error);
      setTimeout(() => router.push("/admin/expenses"), 1000);
      return true;
    };

    toast.promise(saveAction(), {
      pending: "Saving daily record...",
      success: "Daily record created successfully! 🎉",
      error: "Failed to save record ❌",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/expenses"
            className="p-2 border rounded-lg hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Daily Financial Record</h1>
        </div>
        <button
          type="submit"
          disabled={loadingBranches}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Record
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-500" /> Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location / Branch *</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {loadingBranches ? (
                <option>Loading locations...</option>
              ) : (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.address ? `(${b.address})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Financial Fields & Textarea Comments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          
          {/* Admission DELF A1 */}
          <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Admission DELF A1 (€)</label>
            <input
              type="number"
              step="0.01"
              value={admissionDelfA1 === 0 ? "" : admissionDelfA1}
              onChange={(e) => setAdmissionDelfA1(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <textarea
              rows={2}
              placeholder="Comment for A1..."
              value={admissionDelfA1Comment}
              onChange={(e) => setAdmissionDelfA1Comment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Admission DELF A2 */}
          <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Admission DELF A2 (€)</label>
            <input
              type="number"
              step="0.01"
              value={admissionDelfA2 === 0 ? "" : admissionDelfA2}
              onChange={(e) => setAdmissionDelfA2(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <textarea
              rows={2}
              placeholder="Comment for A2..."
              value={admissionDelfA2Comment}
              onChange={(e) => setAdmissionDelfA2Comment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Admission DELF B1 */}
          <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Admission DELF B1 (€)</label>
            <input
              type="number"
              step="0.01"
              value={admissionDelfB1 === 0 ? "" : admissionDelfB1}
              onChange={(e) => setAdmissionDelfB1(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <textarea
              rows={2}
              placeholder="Comment for B1..."
              value={admissionDelfB1Comment}
              onChange={(e) => setAdmissionDelfB1Comment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Admission DELF B2 */}
          <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Admission DELF B2 (€)</label>
            <input
              type="number"
              step="0.01"
              value={admissionDelfB2 === 0 ? "" : admissionDelfB2}
              onChange={(e) => setAdmissionDelfB2(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <textarea
              rows={2}
              placeholder="Comment for B2..."
              value={admissionDelfB2Comment}
              onChange={(e) => setAdmissionDelfB2Comment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* DELF Exam */}
          <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">DELF Exam (€)</label>
            <input
              type="number"
              step="0.01"
              value={delfExam === 0 ? "" : delfExam}
              onChange={(e) => setDelfExam(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <textarea
              rows={2}
              placeholder="Comment for Exam..."
              value={delfExamComment}
              onChange={(e) => setDelfExamComment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* PDF */}
          <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">PDF (€)</label>
            <input
              type="number"
              step="0.01"
              value={pdf === 0 ? "" : pdf}
              onChange={(e) => setPdf(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <textarea
              rows={2}
              placeholder="Comment for PDF..."
              value={pdfComment}
              onChange={(e) => setPdfComment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Civique */}
          <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Civique (€)</label>
            <input
              type="number"
              step="0.01"
              value={civique === 0 ? "" : civique}
              onChange={(e) => setCivique(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <textarea
              rows={2}
              placeholder="Comment for Civique..."
              value={civiqueComment}
              onChange={(e) => setCiviqueComment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Expenses */}
          <div className="p-3 bg-rose-50/30 rounded-xl border border-rose-200 space-y-2">
            <label className="block text-xs font-semibold text-rose-700">Expenses (€)</label>
            <input
              type="number"
              step="0.01"
              value={expenses === 0 ? "" : expenses}
              onChange={(e) => setExpenses(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              className="w-full border border-rose-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <textarea
              rows={2}
              placeholder="Comment for Expenses..."
              value={expensesComment}
              onChange={(e) => setExpensesComment(e.target.value)}
              className="w-full border border-rose-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-600 focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
          </div>

        </div>

        {/* Overall General Comment */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-gray-500" /> Overall Daily Comment / Notes
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="General remarks or notes for the day..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Live Calculation Summary Bar */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-around items-center text-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Income</p>
            <p className="text-lg font-bold text-emerald-600">€{totalIncome.toFixed(2)}</p>
          </div>
          <div className="border-r h-8 border-gray-300"></div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Daily Profit / Loss</p>
            <p className={`text-lg font-bold ${profitLoss >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
              €{profitLoss.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}