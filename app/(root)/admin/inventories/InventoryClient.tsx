// app/admin/inventories/InventoryClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { getInventories, deleteInventory } from "@/actions/inventory";

type InventoryClientProps = {
  userRole?: "SUPERADMIN" | "ADMIN" | string;
};

export default function InventoryClient({ userRole = "SUPERADMIN" }: InventoryClientProps) {
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isSuperAdmin = userRole === "SUPERADMIN";

  const fetchInventories = async () => {
    // If ADMIN, they don't have access to view inventory listings
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await getInventories();
    if (res.success) {
      setInventories(res.data || []);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventories();
  }, [userRole]);

  const handleDeleteAction = async () => {
    if (!deleteId || !isSuperAdmin) return;
    const idToDelete = deleteId;
    setDeleteId(null);

    const deletePromise = async () => {
      const res = await deleteInventory(idToDelete);
      if (!res.success) throw new Error(res.error);
      await fetchInventories();
      return true;
    };

    toast.promise(deletePromise(), {
      pending: "Deleting inventory...",
      success: "Inventory deleted successfully! 👌",
      error: {
        render({ data }: any) {
          return data?.message || "Failed to delete inventory 🤯";
        },
      },
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSuperAdmin ? "Inventories" : "Inventory Submission"}
          </h1>
          <p className="text-sm text-gray-500">
            {isSuperAdmin
              ? "Manage student inventories and spreadsheet records"
              : "Create and submit new student inventory records"}
          </p>
        </div>
        <Link
          href="/admin/inventories/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Inventory
        </Link>
      </div>

      {/* RENDER RESTRICTED VIEW FOR ADMIN ROLE */}
      {!isSuperAdmin ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-xl mx-auto shadow-sm space-y-4 mt-12">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ready to record student inventories?</h2>
          <p className="text-sm text-gray-500">
            As an Administrator, you have access to create and submit new inventory entries. Click the button above to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3 px-4 w-16">SL</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Students</th>
                <th className="py-3 px-4">Total Tarif (€)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Loading inventories...
                  </td>
                </tr>
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No inventory records found in database.
                  </td>
                </tr>
              ) : (
                inventories.map((item, index) => {
                  const totalTarifSum = item.students.reduce(
                    (acc: number, s: any) => acc + Number(s.tarif),
                    0
                  );
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="py-3.5 px-4 font-medium text-gray-500">{index + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{item.title}</td>
                      <td className="py-3.5 px-4 text-gray-600">{item.students.length} Students</td>
                      <td className="py-3.5 px-4 text-gray-900 font-medium">
                        €{totalTarifSum.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/inventories/${item.id}`}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/inventories/${item.id}/edit`}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && isSuperAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Are you absolutely sure?</h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone. This will permanently delete this inventory and all related students.
            </p>
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