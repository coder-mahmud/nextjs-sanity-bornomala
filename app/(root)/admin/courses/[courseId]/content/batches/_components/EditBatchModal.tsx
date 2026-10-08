"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, Video, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { updateBatch } from "../actions";

interface BatchData {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  maxStudents: number | null;
  meetingPlatform: string | null;
  meetingLink: string | null;
  meetingPassword: string | null;
}

export default function EditBatchModal({ batch }: { batch: BatchData }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    title: batch.title || "",
    slug: batch.slug || "",
    status: batch.status || "UPCOMING",
    maxStudents: batch.maxStudents ? String(batch.maxStudents) : "",
    startDate: formatDateForInput(batch.startDate),
    endDate: formatDateForInput(batch.endDate),
    meetingPlatform: batch.meetingPlatform || "ZOOM",
    meetingLink: batch.meetingLink || "",
    meetingPassword: batch.meetingPassword || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatePromise = (async () => {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("status", formData.status);
      data.append("maxStudents", formData.maxStudents);
      data.append("startDate", formData.startDate);
      data.append("endDate", formData.endDate);
      data.append("meetingPlatform", formData.meetingPlatform);
      data.append("meetingLink", formData.meetingLink);
      data.append("meetingPassword", formData.meetingPassword);

      const res = await updateBatch(batch.id, batch.courseId, data);
      if (res.status === "error") {
        throw new Error(res.message || "Failed to update batch.");
      }

      setIsOpen(false);
      router.refresh();
      return res;
    })();

    toast
      .promise(updatePromise, {
        pending: "Updating batch details...",
        success: "Batch details updated successfully! 🎉",
        error: {
          render({ data }: any) {
            return data?.message || "Error updating batch.";
          },
        },
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit Batch Info
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Batch Details</h3>
                <p className="text-xs text-gray-500">Update live stream room links, access limits, and schedules.</p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Batch Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Max Student Capacity</label>
                  <input
                    type="number"
                    placeholder="e.g. 50 (leave empty for unlimited)"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Schedule Dates */}
              <div className="p-3.5 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Batch Schedule Timeline</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-600">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-600">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Live Meeting Details */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl space-y-3 border border-indigo-100">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Live Meeting Integration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-600">Platform Name</label>
                    <select
                      value={formData.meetingPlatform}
                      onChange={(e) => setFormData({ ...formData, meetingPlatform: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ZOOM">ZOOM</option>
                      <option value="GOOGLE_MEET">GOOGLE_MEET</option>
                      <option value="MICROSOFT_TEAMS">MICROSOFT_TEAMS</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-gray-600">Meeting Link / URL</label>
                    <input
                      type="url"
                      placeholder="https://zoom.us/j/..."
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600">Passcode / PIN</label>
                  <input
                    type="text"
                    placeholder="Passcode"
                    value={formData.meetingPassword}
                    onChange={(e) => setFormData({ ...formData, meetingPassword: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}