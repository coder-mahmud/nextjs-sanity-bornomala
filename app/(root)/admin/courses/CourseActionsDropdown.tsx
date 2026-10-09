"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, Eye, BookOpen } from "lucide-react";
import { deleteCourse } from "./actions";
import DeleteConfirmationModal from "./_components/DeleteConfirmationModal";
import { toast } from "react-toastify";

export default function CourseActionsDropdown({ courseId }: { courseId: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteCourse(courseId);
    setIsDeleting(false);

    if (res?.success) {
      toast.success("Course deleted successfully!");
      setShowDeleteModal(false);
    } else {
      toast.error(res?.message || "Failed to delete course");
    }
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
              {/* Show Details */}
              <Link
                href={`/admin/courses/${courseId}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setDropdownOpen(false)}
              >
                <Eye className="h-3.5 w-3.5 text-blue-500" />
                <span>Show Details</span>
              </Link>

              {/* Course Content */}
              <Link
                href={`/admin/courses/${courseId}/content`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setDropdownOpen(false)}
              >
                <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                <span>Course Content</span>
              </Link>

              {/* Edit Details */}
              <Link
                href={`/admin/courses/${courseId}/edit`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setDropdownOpen(false)}
              >
                <Edit className="h-3.5 w-3.5 text-gray-500" />
                <span>Edit Details</span>
              </Link>

              <div className="my-1 border-t border-gray-100" />

              {/* Delete Course */}
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setShowDeleteModal(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                <span>Delete Course</span>
              </button>
            </div>
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}