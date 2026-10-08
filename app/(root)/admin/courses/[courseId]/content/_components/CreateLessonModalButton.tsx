"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCloudinaryImage } from "@/actions/cloudinary";
import { Plus, X, Video, Paperclip, Trash2, Loader2 } from "lucide-react";

interface CreateLessonModalButtonProps {
  courseId: string;
  batches: { id: string; title: string }[];
  quizzes?: { id: string; title: string; lessonId: string | null }[];
}

export default function CreateLessonModalButton({
  courseId,
  batches,
  quizzes = [],
}: CreateLessonModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    batchId: batches[0]?.id || "",
    quizId: "",
    order: 1,
    isPreview: false,
    startsAt: "",
    endsAt: "",
    videoUrl: "",
    bunnyLibraryId: "",
    bunnyVideoId: "",
    notes: "",
    attachments: [] as string[],
  });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      data.append("folder", "lesson_attachments");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();

      if (res.ok && result.secure_url) {
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, result.secure_url],
        }));
      } else {
        throw new Error(result.error?.message || "Failed to upload file to Cloudinary");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = async (urlToRemove: string) => {
    try {
      await deleteCloudinaryImage(urlToRemove);
    } catch (err) {
      console.error("Cloudinary deletion failed, removing link from list anyway:", err);
    } finally {
      setFormData((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((url) => url !== urlToRemove),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          courseId,
          order: Number(formData.order),
          batchId: formData.batchId || null,
          quizId: formData.quizId || null,
          startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
          endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create lesson.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
      >
        <Plus className="w-4 h-4" />
        Add New Lesson
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Create New Lesson
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Introduction to React"
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

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of what this lesson covers..."
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Batch, Quiz & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Assign Batch</label>
                  <select
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">No Batch (Unassigned)</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Link Quiz</label>
                  <select
                    value={formData.quizId}
                    onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">No Quiz Linked</option>
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id} disabled={Boolean(q.lessonId)}>
                        {q.title} {q.lessonId ? "(Already Linked)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Lesson Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Schedule Windows (Lesson/Quiz Timing) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-blue-50/50 p-3 border border-blue-100">
                <div>
                  <label className="block text-xs font-semibold text-blue-900">Starts At (Schedule Window)</label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-900">Ends At (Schedule Window)</label>
                  <input
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Is Preview Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPreviewCreate"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPreviewCreate" className="text-xs font-medium text-gray-700">
                  Allow Free Preview (Unenrolled students can watch)
                </label>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">Video URL</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Bunny Stream Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-gray-50 p-3 border border-gray-200">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600">Bunny Library ID</label>
                  <input
                    type="text"
                    value={formData.bunnyLibraryId}
                    onChange={(e) => setFormData({ ...formData, bunnyLibraryId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:outline-none bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600">Bunny Video ID</label>
                  <input
                    type="text"
                    value={formData.bunnyVideoId}
                    onChange={(e) => setFormData({ ...formData, bunnyVideoId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:outline-none bg-white font-mono"
                  />
                </div>
              </div>

              {/* Cloudinary File Attachments */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Attachments & Resources</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer transition">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload File via Cloudinary"}</span>
                    <input
                      type="file"
                      onChange={handleAttachmentUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && <p className="text-xs text-rose-600 mt-1">{uploadError}</p>}

                {formData.attachments.length > 0 && (
                  <ul className="mt-2 space-y-2 border rounded-xl p-3 bg-gray-50/50">
                    {formData.attachments.map((url, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs text-gray-600 bg-white p-2 rounded-lg border"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:underline text-blue-600 max-w-xs font-mono"
                        >
                          {url}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeAttachment(url)}
                          className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Lecture Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">Lecture Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Formatted text, links, or instructions for students..."
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

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
                  disabled={loading || uploading}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Save Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}