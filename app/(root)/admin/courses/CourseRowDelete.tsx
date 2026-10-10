"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCourse } from "./actions";
import DeleteConfirmationModal from "./_components/DeleteConfirmationModal";
import { toast } from "react-toastify";

export default function CourseRowDelete({ courseId }: { courseId: string }) {
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
      <button
        type="button"
        title="Delete Course"
        onClick={() => setShowDeleteModal(true)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}