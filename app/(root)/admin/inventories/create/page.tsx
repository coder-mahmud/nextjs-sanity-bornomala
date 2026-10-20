"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createInventory } from "@/actions/inventory";

export default function CreateInventoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [students, setStudents] = useState([
    {
      id: "1",
      studentId: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      subscriptionDate: "",
      totalAmount: 0,
      discount: 0,
      paidAmount: 0,
      paymentDates: [""], // Array of date strings for Day.js compatibility
      location: "PARIS" as const,
    },
  ]);

  const handleStudentChange = (index: number, field: string, value: any) => {
    const updated = [...students] as any;
    updated[index][field] = value;
    setStudents(updated);
  };

  const handlePaymentDateChange = (studentIndex: number, dateIndex: number, value: string) => {
    const updated = [...students];
    const dates = [...updated[studentIndex].paymentDates];
    dates[dateIndex] = value;
    updated[studentIndex].paymentDates = dates;
    setStudents(updated);
  };

  const addPaymentDate = (studentIndex: number) => {
    const updated = [...students];
    updated[studentIndex].paymentDates.push("");
    setStudents(updated);
  };

  const removePaymentDate = (studentIndex: number, dateIndex: number) => {
    const updated = [...students];
    updated[studentIndex].paymentDates = updated[studentIndex].paymentDates.filter((_, i) => i !== dateIndex);
    setStudents(updated);
  };

  const addStudent = () => {
    setStudents([
      ...students,
      {
        id: Date.now().toString(),
        studentId: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        subscriptionDate: "",
        totalAmount: 0,
        discount: 0,
        paidAmount: 0,
        paymentDates: [""],
        location: "PARIS",
      },
    ]);
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saveAction = async () => {
      const res = await createInventory({ title, students });
      if (!res.success) throw new Error(res.error);
      setTimeout(() => router.push("/admin/inventories"), 1000);
      return true;
    };

    toast.promise(saveAction(), {
      pending: "Saving inventory to database...",
      success: "Inventory created successfully! 🎉",
      error: {
        render({ data }: any) {
          return data?.message || "Failed to save inventory ❌";
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/inventories"
            className="p-2 border rounded-lg hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Inventory</h1>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Inventory
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Inventory Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Batch 02 - Intensive French"
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Students List</h2>
          <button
            type="button"
            onClick={addStudent}
            className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-medium transition"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>

        <div className="space-y-6">
          {students.map((student, sIndex) => {
            const due = (Number(student.totalAmount) || 0) - (Number(student.discount) || 0) - (Number(student.paidAmount) || 0);
            return (
              <div
                key={student.id}
                className="p-5 border border-gray-200 rounded-xl bg-gray-50/60 space-y-4 relative"
              >
                {/* Remove student row */}
                {students.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStudent(sIndex)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1 bg-white border border-red-200 rounded-lg shadow-sm transition"
                    title="Remove Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Student ID</label>
                    <input
                      type="text"
                      value={student.studentId}
                      onChange={(e) => handleStudentChange(sIndex, "studentId", e.target.value)}
                      placeholder="e.g. STU-001"
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">First Name *</label>
                    <input
                      type="text"
                      value={student.firstName}
                      onChange={(e) => handleStudentChange(sIndex, "firstName", e.target.value)}
                      required
                      placeholder="First name"
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Last Name *</label>
                    <input
                      type="text"
                      value={student.lastName}
                      onChange={(e) => handleStudentChange(sIndex, "lastName", e.target.value)}
                      required
                      placeholder="Last name"
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Phone Number</label>
                    <input
                      type="text"
                      value={student.phoneNumber}
                      onChange={(e) => handleStudentChange(sIndex, "phoneNumber", e.target.value)}
                      placeholder="+33 6..."
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Subscription Date</label>
                    <input
                      type="date"
                      value={student.subscriptionDate}
                      onChange={(e) => handleStudentChange(sIndex, "subscriptionDate", e.target.value)}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Location</label>
                    <select
                      value={student.location}
                      onChange={(e) => handleStudentChange(sIndex, "location", e.target.value)}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="PARIS">Paris</option>
                      <option value="HOCHE">Hoche</option>
                      <option value="ONLINE">Online</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Total Amount (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={student.totalAmount}
                      onChange={(e) => handleStudentChange(sIndex, "totalAmount", parseFloat(e.target.value))}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Discount (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={student.discount}
                      onChange={(e) => handleStudentChange(sIndex, "discount", parseFloat(e.target.value))}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Paid Amount (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={student.paidAmount}
                      onChange={(e) => handleStudentChange(sIndex, "paidAmount", parseFloat(e.target.value))}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Calculated Due (€)</label>
                    <span className="block mt-2 text-base font-bold text-rose-600">€{due.toFixed(2)}</span>
                  </div>
                </div>

                {/* Multiple Payment Dates Section */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className=" text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" /> Payment Dates
                    </label>
                    <button
                      type="button"
                      onClick={() => addPaymentDate(sIndex)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      + Add Payment Date
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {student.paymentDates.map((pDate, dIndex) => (
                      <div key={dIndex} className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-md">
                        <input
                          type="date"
                          value={pDate}
                          onChange={(e) => handlePaymentDateChange(sIndex, dIndex, e.target.value)}
                          className="text-xs border-0 focus:outline-none bg-transparent"
                        />
                        {student.paymentDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePaymentDate(sIndex, dIndex)}
                            className="text-red-500 hover:text-red-700 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}