"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Calendar, Video, Users } from "lucide-react";
import { toast } from "react-toastify";
import { createBatch } from "../actions";

interface CreateBatchModalButtonProps {
  courseId: string;
}

export default function CreateBatchModalButton({ courseId }: CreateBatchModalButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    startDate: "",
    endDate: "",
    meetingPlatform: "ZOOM",
    meetingLink: "",
    meetingPassword: "",
    maxStudents: "",
    status: "UPCOMING",
  });

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const data = new FormData();
        data.append("courseId", courseId);
        data.append("title", formData.title);
        data.append("slug", formData.slug);
        data.append("startDate", formData.startDate);
        data.append("endDate", formData.endDate);
        data.append("meetingPlatform", formData.meetingPlatform);
        data.append("meetingLink", formData.meetingLink);
        data.append("meetingPassword", formData.meetingPassword);
        data.append("maxStudents", formData.maxStudents);
        data.append("status", formData.status);

        const res = await createBatch(null, data);

        if (res.status === "success") {
          resolve(res);
          setIsOpen(false);
          setFormData({
            title: "",
            slug: "",
            startDate: "",
            endDate: "",
            meetingPlatform: "ZOOM",
            meetingLink: "",
            meetingPassword: "",
            maxStudents: "",
            status: "UPCOMING",
          });
          router.refresh();
        } else {
          reject(new Error(res.message || "Failed to create batch."));
        }
      } catch (err) {
        reject(err);
      } finally {
        setLoading(false);
      }
    });

    toast.promise(promise, {
      pending: "Creating batch...",
      success: "Batch created successfully! 🎉",
      error: {
        render({ data }: any) {
          return data?.message || "Error creating batch.";
        },
      },
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
      >
        <Plus className="w-4 h-4" />
        Create Batch
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-gray-900">Create New Batch</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Batch Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batch 01 - Spring 2026"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-gray-50 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Status & Max Students */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Max Students Capacity</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none pl-9"
                    />
                    <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Schedule Dates */}
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-gray-700 font-semibold text-xs">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Batch Schedule
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">End Date (Access Expiry)</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Meeting Details */}
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Video className="w-4 h-4 text-blue-600" />
                  Live Class Link (Optional)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Platform</label>
                    <select
                      value={formData.meetingPlatform}
                      onChange={(e) => setFormData({ ...formData, meetingPlatform: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none bg-white"
                    >
                      <option value="ZOOM">ZOOM</option>
                      <option value="GOOGLE_MEET">GOOGLE_MEET</option>
                      <option value="MICROSOFT_TEAMS">MICROSOFT_TEAMS</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600">Meeting Link</label>
                    <input
                      type="url"
                      placeholder="https://zoom.us/j/..."
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600">Passcode / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Passcode: 123456"
                    value={formData.meetingPassword}
                    onChange={(e) => setFormData({ ...formData, meetingPassword: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Save Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}