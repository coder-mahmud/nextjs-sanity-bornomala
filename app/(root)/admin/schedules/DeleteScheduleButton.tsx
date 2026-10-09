"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "./_components/ConfirmDeleteModal";
import { deleteSchedule } from "./actions";

export default function DeleteScheduleButton({ scheduleId }: { scheduleId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await deleteSchedule(scheduleId);
      if (res?.success) {
        toast.success("Schedule deleted successfully!");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res?.message || "Failed to delete schedule.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An error occurred while deleting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
        title="Delete Schedule"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmDeleteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule entry? All attached time slots will be permanently removed."
      />
    </>
  );
}