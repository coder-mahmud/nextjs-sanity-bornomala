"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSchedule } from "../../actions"; // Adjust path to server action

import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";

interface BranchOption {
  id: string;
  name: string;
  address: string | null;
}

interface ScheduleEntryRow {
  id?: string;
  day: string;
  time: string;
  startingDate: string;
}

interface EditScheduleFormProps {
  schedule: {
    id: string;
    branchId: string;
    level: string | null;
    description: string | null;
    entries: ScheduleEntryRow[];
  };
  branches: BranchOption[];
}

export default function EditScheduleForm({
  schedule,
  branches,
}: EditScheduleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    branchId: schedule.branchId || "",
    level: schedule.level || "",
    description: schedule.description || "",
  });

  const [entries, setEntries] = useState<ScheduleEntryRow[]>(
    schedule.entries.length > 0
      ? schedule.entries
      : [{ day: "", time: "", startingDate: "" }]
  );

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        day: "",
        time: "",
        startingDate: "",
      },
    ]);
  };

  const handleRemoveEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleEntryChange = (
    index: number,
    field: keyof ScheduleEntryRow,
    value: string
  ) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append("branchId", formData.branchId);
    payload.append("level", formData.level);
    payload.append("description", formData.description);
    payload.append("entries", JSON.stringify(entries));

    toast
      .promise(updateSchedule(schedule.id, payload), {
        pending: "Updating schedule...",
        success: "Schedule updated successfully!",
        error: "Failed to update schedule.",
      })
      .then((res) => {
        if (res?.success) {
          router.push("/admin/schedules");
          router.refresh();
        } else if (res?.message) {
          toast.error(res.message);
        }
      })
      .catch((err) => {
        console.error("Error updating schedule:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Branch Selection */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Branch *
        </label>
        <select
          value={formData.branchId}
          onChange={(e) =>
            setFormData({ ...formData, branchId: e.target.value })
          }
          required
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
        >
          <option value="">-- Select Branch --</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} {branch.address ? `(${branch.address})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Level & Description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Level / Tag
          </label>
          <input
            type="text"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            placeholder="e.g. Beginner or DELF A1"
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g. DELF পরীক্ষার জন্য বিশেষ প্রস্তুতি..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Schedule Time Slots */}
      <div className="border-t pt-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Schedule Time Slots
          </h3>
          <button
            type="button"
            onClick={handleAddEntry}
            className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Time Slot
          </button>
        </div>

        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 border border-gray-200 rounded-xl bg-gray-50"
            >
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                  Day *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. সোমবার"
                  value={entry.day}
                  onChange={(e) =>
                    handleEntryChange(index, "day", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                  Time *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. সকাল ১১:০০ টা - ০২:০০ টা"
                  value={entry.time}
                  onChange={(e) =>
                    handleEntryChange(index, "time", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                  Start Date *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ০৫ ডিসেম্বর"
                  value={entry.startingDate}
                  onChange={(e) =>
                    handleEntryChange(index, "startingDate", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end sm:justify-center pt-2 sm:pt-4">
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(index)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}