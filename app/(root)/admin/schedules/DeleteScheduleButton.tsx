"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSchedule } from "./actions";
import { toast } from "react-toastify";

export default function DeleteScheduleButton({ scheduleId }: { scheduleId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    setLoading(true);
    const res = await deleteSchedule(scheduleId);
    setLoading(false);

    if (res.success) {
      toast.success("Schedule deleted successfully!");
    } else {
      toast.error(res.message || "Failed to delete schedule");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}