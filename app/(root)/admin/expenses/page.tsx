"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, Plus, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getDailyExpenses, deleteDailyExpense } from "@/actions/expense";

export default function DailyExpensesListPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await getDailyExpenses();
    if (res.success) {
      setExpenses(res.data || []);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDeleteAction = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setDeleteId(null);

    const deletePromise = async () => {
      const res = await deleteDailyExpense(idToDelete);
      if (!res.success) throw new Error(res.error);
      await fetchExpenses();
      return true;
    };

    toast.promise(deletePromise(), {
      pending: "Deleting daily record...",
      success: "Record deleted successfully! 👌",
      error: "Failed to delete record 🤯",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Expenses & Revenue</h1>
          <p className="text-sm text-gray-500">Track daily branch admissions, exam fees, and profits</p>
        </div>
        <Link
          href="/admin/expenses/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Daily Record
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Total Income (€)</th>
              <th className="py-3 px-4">Expenses (€)</th>
              <th className="py-3 px-4">Profit / Loss (€)</th>
              <th className="py-3 px-4">Comment</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Loading records...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No financial records found.
                </td>
              </tr>
            ) : (
              expenses.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4 font-medium text-gray-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {dayjs(item.date).format("DD/MM/YYYY")}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.branch?.name || "N/A"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">€{Number(item.total).toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-medium text-rose-600">€{Number(item.expenses).toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    <span className={Number(item.profit) >= 0 ? "text-emerald-700" : "text-rose-700"}>
                      €{Number(item.profit).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-xs italic">{item.comment || "—"}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/expenses/${item.id}`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/expenses/${item.id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Are you sure?</h3>
            <p className="text-sm text-gray-500">This action cannot be undone. This record will be permanently deleted.</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAction}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-medium text-sm shadow-sm transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}