// app/admin/courses/_components/CreateLessonModalButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Paperclip, Trash2, Loader2, Video, FileText, CalendarClock } from "lucide-react";
import { toast } from "react-toastify";
import { createLesson } from "@/app/(root)/admin/courses/actions";
import { deleteCloudinaryImage } from "@/actions/cloudinary";

interface AttachmentItem {
  name: string;
  url: string;
}

interface CreateLessonModalButtonProps {
  courseId: string;
  batchId: string;
  quizzes: { id: string; title: string }[];
}

export default function CreateLessonModalButton({
  courseId,
  batchId,
  quizzes,
}: CreateLessonModalButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [attachmentNameInput, setAttachmentNameInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    batchId: batchId, // Automatically bound to current batch
    quizId: "",
    order: 1,
    isPreview: false,
    startsAt: "",
    endsAt: "",
    videoUrl: "",
    bunnyLibraryId: "",
    bunnyVideoId: "",
    notes: "",
    attachments: [] as AttachmentItem[],
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
          const newAttachment: AttachmentItem = {
            name: attachmentNameInput.trim() || file.name,
            url: result.secure_url,
          };

          setFormData((prev) => ({
            ...prev,
            attachments: [...prev.attachments, newAttachment],
          }));

          setAttachmentNameInput(""); 
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

  const removeAttachment = async (attachment: AttachmentItem) => {
    try {
      await deleteCloudinaryImage(attachment.url);
    } catch (err) {
      console.error(err);
    } finally {
      setFormData((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((item) => item.url !== attachment.url),
      }));
      toast.info("Attachment removed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        batchId: batchId,
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

    toast
      .promise(createLessonPromise, {
        pending: "Creating lesson...",
        success: "Lesson created successfully! 🎉",
        error: {
          render({ data }: any) {
            return data?.message || "Error creating lesson.";
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
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
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
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quiz & Order (Batch Selection Ditched) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Lesson Schedule */}
              {formData.quizId && (
                <div className="rounded-xl bg-purple-50/60 p-4 border border-purple-100 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs">
                    <CalendarClock className="w-4 h-4" />
                    Lesson Quiz time
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
              )}

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

              {/* Attachments Section with Name Input */}
              <div className="border-t pt-3 space-y-3 bg-gray-50/50 p-3.5 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-800">
                  Lesson Attachments
                </label>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Attachment Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Chapter 1 Worksheets (Leave blank to use original filename)"
                      value={attachmentNameInput}
                      onChange={(e) => setAttachmentNameInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer transition">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Paperclip className="w-4 h-4 text-white" />
                      )}
                      <span>{uploading ? "Uploading File..." : "Choose & Upload File"}</span>
                      <input
                        type="file"
                        onChange={handleAttachmentUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-200">
                    <p className="text-[11px] font-semibold text-gray-600">Attached Files:</p>
                    <ul className="space-y-1.5">
                      {formData.attachments.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono truncate max-w-xs">
                              ({item.url})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(item)}
                            className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer shrink-0"
                            title="Remove Attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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