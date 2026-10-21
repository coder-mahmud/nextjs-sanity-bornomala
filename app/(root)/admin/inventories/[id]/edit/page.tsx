"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getInventoryById, updateInventory } from "@/actions/inventory";

export default function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const inventoryId = resolvedParams.id;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      const res = await getInventoryById(inventoryId);
      if (res.success && res.data) {
        setTitle(res.data.title);
        // Map database records to the new spreadsheet column field shape
        setStudents(
          res.data.students.map((s: any) => ({
            id: s.id,
            identity: s.identity || "",
            lastName: s.lastName || "",
            firstName: s.firstName || "",
            phoneNumber: s.phoneNumber || "",
            subscriptionDate: s.subscriptionDate ? s.subscriptionDate.split("T")[0] : "",
            tarif: Number(s.tarif) || 0,
            deduit: Number(s.deduit) || 0,
            paye: Number(s.paye) || 0,
            birthPlace: s.birthPlace || "",
            city: s.city || "",
            comment: s.comment || "",
          }))
        );
      } else {
        toast.error(res.error || "Failed to fetch inventory data");
      }
      setLoading(false);
    }
    fetchInventory();
  }, [inventoryId]);

  const handleStudentChange = (index: number, field: string, value: any) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
  };

  const addStudent = () => {
    setStudents([
      ...students,
      {
        identity: "",
        lastName: "",
        firstName: "",
        phoneNumber: "",
        subscriptionDate: "",
        tarif: 0,
        deduit: 0,
        paye: 0,
        birthPlace: "",
        city: "",
        comment: "",
      },
    ]);
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saveAction = async () => {
      const res = await updateInventory(inventoryId, { title, students });
      if (!res.success) throw new Error(res.error);
      setTimeout(() => router.push("/admin/inventories"), 1000);
      return true;
    };

    toast.promise(saveAction(), {
      pending: "Updating inventory in database...",
      success: "Inventory updated successfully! 🎉",
      error: {
        render({ data }: any) {
          return data?.message || "Failed to update inventory ❌";
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-20 text-gray-500">
        Loading form details...
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Inventory</h1>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Inventory Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            const aRegler = (Number(student.tarif) || 0) - (Number(student.deduit) || 0) - (Number(student.paye) || 0);

            return (
              <div
                key={student.id || sIndex}
                className="p-5 border border-gray-200 rounded-xl bg-gray-50/60 space-y-4 relative"
              >
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Identité</label>
                    <input
                      type="text"
                      value={student.identity}
                      onChange={(e) => handleStudentChange(sIndex, "identity", e.target.value)}
                      placeholder="e.g. 3798"
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Nom (Last Name) *</label>
                    <input
                      type="text"
                      value={student.lastName}
                      onChange={(e) => handleStudentChange(sIndex, "lastName", e.target.value)}
                      required
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Prénom (First Name) *</label>
                    <input
                      type="text"
                      value={student.firstName}
                      onChange={(e) => handleStudentChange(sIndex, "firstName", e.target.value)}
                      required
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Numéro tel</label>
                    <input
                      type="text"
                      value={student.phoneNumber}
                      onChange={(e) => handleStudentChange(sIndex, "phoneNumber", e.target.value)}
                      placeholder="605895626"
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Inscription (Date)</label>
                    <input
                      type="date"
                      value={student.subscriptionDate}
                      onChange={(e) => handleStudentChange(sIndex, "subscriptionDate", e.target.value)}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Lieu de naissance</label>
                    <input
                      type="text"
                      value={student.birthPlace}
                      onChange={(e) => handleStudentChange(sIndex, "birthPlace", e.target.value)}
                      placeholder="e.g. Noakhali"
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Ville</label>
                    <input
                      type="text"
                      value={student.city}
                      onChange={(e) => handleStudentChange(sIndex, "city", e.target.value)}
                      placeholder="e.g. Paris 18"
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Commentaire</label>
                    <input
                      type="text"
                      value={student.comment}
                      onChange={(e) => handleStudentChange(sIndex, "comment", e.target.value)}
                      placeholder="Notes"
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Tarif (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={student.tarif}
                      onChange={(e) => handleStudentChange(sIndex, "tarif", parseFloat(e.target.value))}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Déduit (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={student.deduit}
                      onChange={(e) => handleStudentChange(sIndex, "deduit", parseFloat(e.target.value))}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Payé (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={student.paye}
                      onChange={(e) => handleStudentChange(sIndex, "paye", parseFloat(e.target.value))}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">A régler (Due) (€)</label>
                    <span className="block mt-2 text-base font-bold text-rose-600">€{aRegler.toFixed(2)}</span>
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