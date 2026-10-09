"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit3, Layers, BookOpen, Trash2, Eye, Loader2 } from "lucide-react";
import { deleteCourse } from "./actions";

interface CourseActionsDropdownProps {
  courseId: string;
}

export default function CourseActionsDropdown({ courseId }: CourseActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await deleteCourse(courseId);

      if (res?.success) {
        setOpen(false);
        router.refresh();
      } else {
        alert(res?.message || "Failed to delete course.");
      }
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Something went wrong while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition focus:outline-none"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Link
            href={`/admin/courses/${courseId}`}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition"
            onClick={() => setOpen(false)}
          >
            <Eye className="w-4 h-4 text-blue-600" />
            Show Details
          </Link>


          <Link
            href={`/admin/courses/${courseId}/content`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <BookOpen className="w-4 h-4 text-purple-500" />
            Course Content
          </Link>

          <Link
            href={`/admin/courses/${courseId}/edit`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <Edit3 className="w-4 h-4 text-gray-500" />
            Edit Details
          </Link>

          <div className="my-1 border-t border-gray-100" />

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete Course"}
          </button>
        </div>
      )}
    </div>
  );
}