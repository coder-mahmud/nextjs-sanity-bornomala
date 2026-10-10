"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, Pencil, Trash2, AlertTriangle, X } from "lucide-react";
import { deleteInstructor } from "../actions";

interface Instructor {
  id: string;
  name: string;
  title: string | null;
  designation: string | null;
  studentCount: number;
  courseCount: number;
  rating: any;
  imageUrl: string | null;
}

export default function InstructorTable({ initialInstructors }: { initialInstructors: Instructor[] }) {
  const router = useRouter();
  const [instructors, setInstructors] = useState<Instructor[]>(initialInstructors);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(false);

  const openDeleteModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInstructor) return;
    setLoading(true);

    toast
      .promise(deleteInstructor(selectedInstructor.id), {
        pending: "Deleting instructor...",
        success: "Instructor deleted successfully!",
        error: "Failed to delete instructor",
      })
      .then((res) => {
        if (res?.success) {
          setInstructors((prev) => prev.filter((item) => item.id !== selectedInstructor.id));
          setDeleteModalOpen(false);
          setSelectedInstructor(null);
          router.refresh();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-4">Instructor</th>
              <th className="px-6 py-4">Designation</th>
              <th className="px-6 py-4">Students</th>
              <th className="px-6 py-4">Courses</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {instructors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No instructors found.
                </td>
              </tr>
            ) : (
              instructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {instructor.imageUrl ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                          <Image
                            src={instructor.imageUrl}
                            alt={instructor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600">
                          {instructor.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{instructor.name}</div>
                        <div className="text-xs text-gray-500">{instructor.title || "N/A"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{instructor.designation || "N/A"}</td>
                  <td className="px-6 py-4">{instructor.studentCount}</td>
                  <td className="px-6 py-4">{instructor.courseCount}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/instructors/${instructor.id}`}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/instructors/${instructor.id}/edit`}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-emerald-600"
                        title="Edit Instructor"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(instructor)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
                        title="Delete Instructor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Professional Confirmation Modal */}
      {deleteModalOpen && selectedInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Instructor</h3>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete <strong className="text-gray-800">{selectedInstructor.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={loading}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}