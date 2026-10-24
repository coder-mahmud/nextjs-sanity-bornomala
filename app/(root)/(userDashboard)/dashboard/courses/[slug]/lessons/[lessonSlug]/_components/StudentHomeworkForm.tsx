// components/lessons/StudentHomeworkForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CloudinaryUpload from "@/lib/CloudinaryUpload";
import { UploadCloud, Video, FileText, CheckCircle2 } from "lucide-react";

interface StudentHomeworkFormProps {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  cloudName: string;
  uploadPreset: string;
  initialSubmission?: {
    id: string;
    fileUrl: string | null;
    videoUrl: string | null;
    comment: string | null;
  } | null;
  submitAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export default function StudentHomeworkForm({
  lessonId,
  courseSlug,
  lessonSlug,
  cloudName,
  uploadPreset,
  initialSubmission,
  submitAction,
}: StudentHomeworkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [videoUrl, setVideoUrl] = useState(initialSubmission?.videoUrl || "");
  const [comment, setComment] = useState(initialSubmission?.comment || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("lessonId", lessonId);
    formData.append("courseSlug", courseSlug);
    formData.append("lessonSlug", lessonSlug);

    // Grab file value explicitly from Cloudinary hidden input if available
    if (formRef.current) {
      const hiddenInput = formRef.current.querySelector(
        `input[name="homeworkFile"]`
      ) as HTMLInputElement;
      if (hiddenInput && hiddenInput.value) {
        formData.set("fileUrl", hiddenInput.value);
      }
    }

    // Wrap the async server action inside toast.promise
    toast
      .promise(submitAction(formData), {
        pending: "Submitting homework...",
        success: "Homework submitted successfully!",
        error: "Failed to submit homework",
      })
      .then((res) => {
        if (res?.success) {
          router.refresh();
        }
      })
      .catch((err) => {
        console.error("Homework submission error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <UploadCloud className="w-4 h-4 text-emerald-600" />
          Lesson Homework Submission
        </div>
        {initialSubmission && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
          </span>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Cloudinary File Upload (Image / PDF) */}
        <div>
          <CloudinaryUpload
            name="homeworkFile"
            label="Upload Homework Document (Image or PDF)"
            defaultValue={initialSubmission?.fileUrl || ""}
            cloudName={cloudName}
            uploadPreset={uploadPreset}
            folder="homeworks"
          />
        </div>

        {/* Google Drive Video Link Field */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-blue-600" /> Video Link (Google Drive / YouTube)
          </label>
          <input
            type="url"
            name="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs outline-none focus:border-blue-500 bg-white"
          />
        </div>

        {/* Optional Comment / Description */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-600" /> Student Comments / Notes
          </label>
          <textarea
            name="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any additional comments or notes about your homework..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs outline-none focus:border-blue-500 bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          {initialSubmission ? "Update Homework Submission" : "Submit Homework"}
        </button>
      </form>
    </div>
  );
}