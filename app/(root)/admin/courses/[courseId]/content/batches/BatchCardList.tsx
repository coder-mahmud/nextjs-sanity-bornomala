"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Users, BookOpen, ChevronRight, Video, Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteBatch } from "./actions";
import { useRouter } from "next/navigation";

interface BatchItem {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  maxStudents: number | null;
  meetingPlatform: string | null;
  _count?: {
    lessons: number;
    accesses: number;
  };
}

export default function BatchCardList({ batches }: { batches: BatchItem[] }) {
  const router = useRouter();
  
  // State for deletion confirmation modal
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!selectedBatch) return;

    setIsDeleting(true);

    const deletePromise = (async () => {
      const res = await deleteBatch(selectedBatch.id, selectedBatch.courseId);
      if (res.status === "error") {
        throw new Error(res.message || "Failed to delete batch.");
      }
      setSelectedBatch(null);
      router.refresh();
      return res;
    })();

    toast
      .promise(deletePromise, {
        pending: "Deleting batch...",
        success: "Batch deleted successfully!",
        error: {
          render({ data }: any) {
            return data?.message || "Error deleting batch.";
          },
        },
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ONGOING":
        return <span className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border">ONGOING</span>;
      case "UPCOMING":
        return <span className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border">UPCOMING</span>;
      case "COMPLETED":
        return <span className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border">COMPLETED</span>;
      default:
        return <span className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border">{status}</span>;
    }
  };

  if (batches.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
        <p className="text-sm font-medium text-gray-500">No batches created for this course yet.</p>
        <p className="text-xs text-gray-400 mt-1">Click "Create Batch" above to set up your first batch.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition">
                    {batch.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">/{batch.slug}</p>
                </div>
                {getStatusBadge(batch.status)}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{batch?._count?.lessons ?? 0} Lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{batch?._count?.accesses ?? 0} Students {batch.maxStudents ? `/ ${batch.maxStudents}` : ""}</span>
                </div>
              </div>

              {/* Start / End Dates */}
              {(batch.startDate || batch.endDate) && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>
                    {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "TBD"} -{" "}
                    {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "TBD"}
                  </span>
                </div>
              )}

              {/* Live Class Indicator */}
              {batch.meetingPlatform && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Video className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{batch.meetingPlatform} Configured</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <button
                onClick={() => setSelectedBatch(batch)}
                className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                title="Delete Batch"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link
                href={`/admin/courses/${batch.courseId}/content/batches/${batch.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                See Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 border border-rose-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Delete Batch</h3>
                  <p className="text-xs text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <button
                disabled={isDeleting}
                onClick={() => setSelectedBatch(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-rose-50/50 p-3.5 border border-rose-100 text-xs text-rose-800 space-y-1">
              <p>
                You are about to delete <span className="font-bold underline">{selectedBatch.title}</span>.
              </p>
              <p className="text-rose-600/90">
                All associated lessons, resources, and student access records for this batch will be permanently removed or unassigned.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSelectedBatch(null)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Yes, Delete Batch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}