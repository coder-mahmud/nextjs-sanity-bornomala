"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Paperclip, Trash2, Loader2, Video, FileText, CalendarClock, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { createLesson } from "@/app/(root)/admin/courses/actions";
import { deleteCloudinaryImage } from "@/actions/cloudinary";

interface CreateLessonModalButtonProps {
  courseId: string;
  batches: { id: string; title: string }[];
  quizzes: { id: string; title: string }[];
}

export default function CreateLessonModalButton({
  courseId,
  batches,
  quizzes,
}: CreateLessonModalButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    batchId: batches.length > 0 ? batches[0].id : "",
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

    const uploadPromise = new Promise(async (resolve, reject) => {
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
          resolve(result);
        } else {
          reject(new Error(result.error?.message || "Cloudinary upload failed"));
        }
      } catch (err) {
        reject(err);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    });

    toast.promise(uploadPromise, {
      pending: "Uploading attachment...",
      success: "Attachment uploaded successfully!",
      error: {
        render({ data }: any) {
          return data?.message || "Failed to upload attachment.";
        },
      },
    });
  };

  const removeAttachment = async (urlToRemove: string) => {
    try {
      await deleteCloudinaryImage(urlToRemove);
    } catch (err) {
      console.error(err);
    } finally {
      setFormData((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((url) => url !== urlToRemove),
      }));
      toast.info("Attachment removed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batchId) {
      toast.error("Please select a batch for this lesson.");
      return;
    }

    setLoading(true);

    const createLessonPromise = (async () => {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("description", formData.description);
      data.append("batchId", formData.batchId);
      data.append("quizId", formData.quizId);
      data.append("order", String(formData.order));
      if (formData.isPreview) data.append("isPreview", "on");
      data.append("startsAt", formData.startsAt);
      data.append("endsAt", formData.endsAt);
      data.append("videoUrl", formData.videoUrl);
      data.append("bunnyLibraryId", formData.bunnyLibraryId);
      data.append("bunnyVideoId", formData.bunnyVideoId);
      data.append("notes", formData.notes);
      data.append("attachments", JSON.stringify(formData.attachments));

      const res = await createLesson(null, data);

      if (res.status === "error") {
        throw new Error(res.message || "Failed to create lesson.");
      }

      setIsOpen(false);
      setFormData({
        title: "",
        slug: "",
        description: "",
        batchId: batches.length > 0 ? batches[0].id : "",
        quizId: "",
        order: 1,
        isPreview: false,
        startsAt: "",
        endsAt: "",
        videoUrl: "",
        bunnyLibraryId: "",
        bunnyVideoId: "",
        notes: "",
        attachments: [],
      });
      router.refresh();

      return res;
    })();

    toast.promise(
      createLessonPromise,
      {
        pending: "Creating lesson...",
        success: "Lesson created successfully! 🎉",
        error: {
          render({ data }: any) {
            return data?.message || "Error creating lesson.";
          },
        },
      }
    ).finally(() => {
      setLoading(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
      >
        <Plus className="w-4 h-4" />
        Add Lesson
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-gray-900">Add New Lesson</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {batches.length === 0 && (
              <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-xs text-amber-800 border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p>
                  No batches exist for this course yet. You must create at least one batch before adding lessons.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Batch, Quiz & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Assign Batch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                  >
                    {batches.length === 0 ? (
                      <option value="">No Batch Available</option>
                    ) : (
                      batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))
                    )}
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
                      <option key={q.id} value={q.id}>
                        {q.title}
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

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Lesson Title *</label>
                  <input
                    type="text"
                    required
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

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Lesson Schedule (StartsAt & EndsAt) */}
              <div className="rounded-xl bg-purple-50/60 p-4 border border-purple-100 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs">
                  <CalendarClock className="w-4 h-4" />
                  Lesson Schedule Window
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Starts At</label>
                    <input
                      type="datetime-local"
                      value={formData.startsAt}
                      onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-purple-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Ends At</label>
                    <input
                      type="datetime-local"
                      value={formData.endsAt}
                      onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-purple-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Video Streaming */}
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Video className="w-4 h-4 text-blue-600" />
                  Video Integration
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600">Video Direct URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Bunny Stream Library ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 123456"
                      value={formData.bunnyLibraryId}
                      onChange={(e) => setFormData({ ...formData, bunnyLibraryId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600">Bunny Stream Video ID</label>
                    <input
                      type="text"
                      placeholder="e.g. abc-123-def"
                      value={formData.bunnyVideoId}
                      onChange={(e) => setFormData({ ...formData, bunnyVideoId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Lecture Notes */}
              <div className="border-t pt-3 space-y-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Lecture Notes / Content
                </label>
                <textarea
                  rows={3}
                  placeholder="Markdown or text notes for students..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Attachments</label>
                <label className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer transition">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Paperclip className="w-4 h-4 text-blue-600" />}
                  <span>{uploading ? "Uploading..." : "Upload File"}</span>
                  <input type="file" onChange={handleAttachmentUpload} disabled={uploading} className="hidden" />
                </label>

                {formData.attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {formData.attachments.map((url, idx) => (
                      <li key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg border">
                        <span className="truncate max-w-md font-mono">{url}</span>
                        <button type="button" onClick={() => removeAttachment(url)} className="text-rose-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Is Preview Checkbox */}
              <div className="flex items-center gap-2 border-t pt-3">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPreview" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Allow Free Preview (accessible without purchase)
                </label>
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
                  disabled={loading || uploading || batches.length === 0}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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