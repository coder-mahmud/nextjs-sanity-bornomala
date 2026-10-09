"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSchedule } from "../actions";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";

interface BranchOption {
  id: string;
  name: string;
  address: string | null;
}

enum WeekDay {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}

interface ScheduleEntryRow {
  day: WeekDay;
  startDate: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function CreateScheduleForm({ branches }: { branches: BranchOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [entries, setEntries] = useState<ScheduleEntryRow[]>([
    {
      day: WeekDay.MONDAY,
      startDate: today,
      date: today,
      startTime: "09:00",
      endTime: "11:00",
    },
  ]);

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        day: WeekDay.MONDAY,
        startDate: today,
        date: today,
        startTime: "09:00",
        endTime: "11:00",
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

    const formData = new FormData(e.currentTarget);
    formData.append("entries", JSON.stringify(entries));

    toast
      .promise(createSchedule(formData), {
        pending: "Creating schedule...",
        success: "Schedule created successfully!",
        error: "Failed to create schedule.",
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
        console.error("Error creating schedule:", err);
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
          name="branchId"
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
            name="level"
            placeholder="e.g. A1.1 or Morning Group"
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Twice a week intensive"
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Dynamic Schedule Entries */}
      <div className="border-t pt-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Schedule Entries</h3>
          <button
            type="button"
            onClick={handleAddEntry}
            className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Time Slot
          </button>
        </div>

        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-center p-3 border border-gray-200 rounded-xl bg-gray-50"
            >
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Day</label>
                <select
                  value={entry.day}
                  onChange={(e) =>
                    handleEntryChange(index, "day", e.target.value as WeekDay)
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white"
                >
                  {Object.values(WeekDay).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Start Date</label>
                <input
                  type="date"
                  value={entry.startDate}
                  onChange={(e) => handleEntryChange(index, "startDate", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">End Date</label>
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => handleEntryChange(index, "date", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Start Time</label>
                <input
                  type="time"
                  value={entry.startTime}
                  onChange={(e) => handleEntryChange(index, "startTime", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">End Time</label>
                <input
                  type="time"
                  value={entry.endTime}
                  onChange={(e) => handleEntryChange(index, "endTime", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white"
                />
              </div>

              <div className="flex justify-end sm:justify-center pt-3 sm:pt-0">
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(index)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? "Creating..." : "Create Schedule"}
        </button>
      </div>
    </form>
  );
}