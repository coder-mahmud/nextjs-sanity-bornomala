"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, DollarSign, CheckCircle2, AlertCircle, Pencil, Eye, X, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { getInventoryById } from "@/actions/inventory";

export default function InventoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const inventoryId = resolvedParams.id;

  const [inventory, setInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null); // State to control the student popup modal

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const res = await getInventoryById(inventoryId);
      if (res.success) {
        setInventory(res.data);
      } else {
        toast.error(res.error || "Failed to load inventory details");
      }
      setLoading(false);
    }
    fetchDetails();
  }, [inventoryId]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-20 text-gray-500">
        Loading inventory details...
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Inventory record not found.</p>
        <Link
          href="/admin/inventories"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Back to Inventories
        </Link>
      </div>
    );
  }

  const students = inventory.students || [];
  const totalStudents = students.length;
  const sumTotalAmount = students.reduce((acc: number, curr: any) => acc + Number(curr.totalAmount), 0);
  const sumPaidAmount = students.reduce((acc: number, curr: any) => acc + Number(curr.paidAmount), 0);
  const sumDueAmount = students.reduce((acc: number, curr: any) => acc + Number(curr.due), 0);
  const sumDiscount = students.reduce((acc: number, curr: any) => acc + Number(curr.discount), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/inventories"
            className="p-2 border rounded-lg hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{inventory.title}</h1>
            <p className="text-sm text-gray-500">Summary Metadata & Student Rosters</p>
          </div>
        </div>

        {/* Edit Button */}
        <Link
          href={`/admin/inventories/${inventoryId}/edit`}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          <Pencil className="w-4 h-4" /> Edit Inventory
        </Link>
      </div>

      {/* Summary Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Students</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Sum Total Amount</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">€{sumTotalAmount.toLocaleString()}</p>
            <span className="text-xs text-gray-400">Discount: €{sumDiscount.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">€{sumPaidAmount.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Due</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">€{sumDueAmount.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Student List</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase bg-gray-50/50">
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Paid</th>
              <th className="py-3 px-4">Due</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {students.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  No students assigned to this inventory record.
                </td>
              </tr>
            ) : (
              students.map((student: any) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                    {student.studentId || "N/A"}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{student.phoneNumber || "N/A"}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                        student.location === "PARIS"
                          ? "bg-blue-100 text-blue-800"
                          : student.location === "HOCHE"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {student.location}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">€{Number(student.totalAmount).toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-gray-500">€{Number(student.discount).toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-medium">
                    €{Number(student.paidAmount).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">
                    €{Number(student.due).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                      title="View Student Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Details Popup Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-xs text-gray-500 font-mono">ID: {selectedStudent.studentId || "N/A"}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Phone Number</p>
                <p className="font-medium text-gray-800 mt-0.5">{selectedStudent.phoneNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Location</p>
                <span className="inline-flex mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {selectedStudent.location}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Subscription Date</p>
                <p className="font-medium text-gray-800 mt-0.5">
                  {selectedStudent.subscriptionDate ? new Date(selectedStudent.subscriptionDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Total Amount</p>
                <p className="font-semibold text-gray-900 mt-0.5">€{Number(selectedStudent.totalAmount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Discount</p>
                <p className="font-semibold text-gray-500 mt-0.5">€{Number(selectedStudent.discount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Paid Amount</p>
                <p className="font-semibold text-emerald-600 mt-0.5">€{Number(selectedStudent.paidAmount).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-semibold uppercase">Due Amount</p>
                <p className="font-semibold text-rose-600 mt-0.5 text-base">€{Number(selectedStudent.due).toLocaleString()}</p>
              </div>
            </div>

            {/* Payment Dates History */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Payment Dates History
              </p>
              {selectedStudent.paymentDates && selectedStudent.paymentDates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.paymentDates.map((pDate: string, idx: number) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
                      {new Date(pDate).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No payment dates recorded.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}