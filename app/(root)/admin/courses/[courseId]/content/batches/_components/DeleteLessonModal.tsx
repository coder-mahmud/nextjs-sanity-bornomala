"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteLesson } from "@/app/(root)/admin/courses/actions";


interface DeleteLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  onSuccess?: () => void;
}

export default function DeleteLessonModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  onSuccess,
}: DeleteLessonModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        const res = await deleteLesson(lessonId);
        if (res.status === "success") {
          resolve(res);
          onSuccess?.();
          onClose();
        } else {
          reject(new Error(res.message || "Failed to delete lesson"));
        }
      } catch (err) {
        reject(err);
      } finally {
        setLoading(false);
      }
    });

    toast.promise(deletePromise, {
      pending: "Deleting lesson...",
      success: "Lesson deleted successfully! 🗑️",
      error: {
        render({ data }: any) {
          return data?.message || "Failed to delete lesson.";
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="rounded-full bg-rose-50 p-3">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Lesson</h3>
            <p className="text-xs text-gray-500">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
          Are you sure you want to delete <span className="font-semibold text-gray-900">"{lessonTitle}"</span>?
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}