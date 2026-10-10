// app/admin/instructors/_components/InstructorForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CloudinaryUpload from "@/lib/CloudinaryUpload";
import { createInstructor, updateInstructor } from "../actions";

interface InstructorData {
  id?: string;
  name?: string | null;
  title?: string | null;
  designation?: string | null;
  experience?: string | null;
  studentCount?: number;
  courseCount?: number;
  rating?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  tags?: string[];
}

interface InstructorFormProps {
  initialData?: InstructorData;
  cloudName: string;
  uploadPreset: string;
}

export default function InstructorForm({
  initialData,
  cloudName,
  uploadPreset,
}: InstructorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData?.id;

  // Use a ref to reference the form element so we can pull the exact active value of the hidden input
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Explicitly grab the latest value from the hidden input field created by CloudinaryUpload
    if (formRef.current) {
      const hiddenInput = formRef.current.querySelector('input[name="imageUrl"]') as HTMLInputElement;
      if (hiddenInput) {
        formData.set("imageUrl", hiddenInput.value);
      }
    }

    const actionPromise = isEditing
      ? updateInstructor(initialData.id!, formData)
      : createInstructor(formData);

    toast
      .promise(actionPromise, {
        pending: isEditing ? "Updating instructor..." : "Creating instructor...",
        success: isEditing ? "Instructor updated!" : "Instructor created successfully!",
        error: "Failed to save instructor",
      })
      .then((res) => {
        if (res?.success) {
          router.push("/admin/instructors");
          router.refresh();
        }
      })
      .catch((err) => {
        console.error("Instructor submission error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={initialData?.name || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            defaultValue={initialData?.title || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Senior Software Engineer"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Designation</label>
          <input
            type="text"
            name="designation"
            defaultValue={initialData?.designation || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Lead Instructor"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Experience</label>
          <input
            type="text"
            name="experience"
            defaultValue={initialData?.experience || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="10+ Years Experience"
          />
        </div>
      </div>

      {/* Cloudinary Profile Image Upload */}
      <div>
        <CloudinaryUpload
          name="imageUrl"
          label="Instructor Profile Image"
          defaultValue={initialData?.imageUrl || ""}
          cloudName={cloudName}
          uploadPreset={uploadPreset}
          folder="instructors"
        />
        {initialData?.imageUrl && (
          <p className="mt-2 text-xs text-gray-500">
            Uploading a new image will automatically replace and delete the old one.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Student Count</label>
          <input
            type="number"
            name="studentCount"
            defaultValue={initialData?.studentCount || 0}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Course Count</label>
          <input
            type="number"
            name="courseCount"
            defaultValue={initialData?.courseCount || 0}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
          <input
            type="number"
            step="0.01"
            name="rating"
            defaultValue={initialData?.rating ? Number(initialData.rating) : ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="4.9"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={initialData?.description || ""}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Biography and details about the instructor..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tags (One per line)
        </label>
        <textarea
          name="tags"
          rows={3}
          defaultValue={initialData?.tags?.join("\n") || ""}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder={"React\nNode.js\nTypeScript"}
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#118F6B] px-6 py-3 font-semibold text-white hover:bg-[#355048] cursor-pointer disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Update Instructor" : "Create Instructor"}
        </button>
      </div>
    </form>
  );
}