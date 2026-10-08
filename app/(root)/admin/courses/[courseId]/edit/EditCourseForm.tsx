"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateCourse } from "../../actions";
import { deleteCloudinaryImage } from "@/actions/cloudinary";
import { Upload, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {toast} from 'react-toastify'

interface InstructorOption {
  id: string;
  name: string;
}

interface EditCourseFormProps {
  course: any;
  instructors?: InstructorOption[];
}

export default function EditCourseForm({ course, instructors = [] }: EditCourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Toast / Notification State
  // const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const initialThumbnail =
    course.thumbnail || course.imageUrl || course.image || "";

  const [formData, setFormData] = useState({
    title: course.title || "",
    tagLine: course.tagLine || "",
    shortDescription: course.shortDescription || "",
    description: course.description || "",
    price: course.price?.toString() || "0",
    currency: course.currency || "EUR",
    level: course.level || "BEGINNER",
    status: course.status || "DRAFT",
    duration: course.duration || "",
    numberOfStudents: course.numberOfStudents || "",
    rating: course.rating || "",
    instructorId: course.instructorId || "",
    order: course.order?.toString() || "0",
    characteristics: Array.isArray(course.characteristics)
      ? course.characteristics.join("\n")
      : "",
    targetAudience: Array.isArray(course.targetAudience)
      ? course.targetAudience.join("\n")
      : "",
    thumbnail: initialThumbnail,
  });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      data.append("folder", "course_thumbnails");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );

      const result = await res.json();

      if (res.ok && result.secure_url) {
        setFormData((prev) => ({ ...prev, thumbnail: result.secure_url }));
      } else {
        throw new Error(result.error?.message || "Cloudinary upload failed");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = async () => {
    if (!formData.thumbnail) return;
    try {
      await deleteCloudinaryImage(formData.thumbnail);
    } catch (err) {
      console.error("Cloudinary deletion failed, removing reference anyway:", err);
    } finally {
      setFormData((prev) => ({ ...prev, thumbnail: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);


    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("tagLine", formData.tagLine);
      payload.append("shortDescription", formData.shortDescription);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("currency", formData.currency);
      payload.append("level", formData.level);
      payload.append("status", formData.status);
      payload.append("duration", formData.duration);
      payload.append("numberOfStudents", formData.numberOfStudents);
      payload.append("rating", formData.rating);
      payload.append("instructorId", formData.instructorId);
      payload.append("order", formData.order);
      payload.append("characteristics", formData.characteristics);
      payload.append("targetAudience", formData.targetAudience);
      payload.append("thumbnail", formData.thumbnail);

      const res = await updateCourse(course.id, payload);

      if (res?.success) {
        // setToast({ type: "success", message: "Course updated successfully!" });
        toast.success('Course updated successfully!')
        router.refresh();
        
      } else {
        toast.error('Failed to update course.')
      }
    } catch (err) {
      console.error(err);
      // setToast({
      //   type: "error",
      //   message: err instanceof Error ? err.message : "An unexpected error occurred while updating.",
      // });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">


      {/* Title & Tagline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700">Course Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Tag Line</label>
          <input
            type="text"
            placeholder="e.g. Master Full-Stack Web Development"
            value={formData.tagLine}
            onChange={(e) => setFormData({ ...formData, tagLine: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700">Short Summary / Catchphrase</label>
        <input
          type="text"
          placeholder="Brief 1-2 sentence preview"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700">Detailed Description</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Characteristics & Target Audience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700">
            Course Features / Characteristics <span className="font-normal text-gray-400">(One per line)</span>
          </label>
          <textarea
            rows={4}
            placeholder="Lifetime Access&#10;Certificate of Completion&#10;Source Code Included"
            value={formData.characteristics}
            onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">
            Target Audience <span className="font-normal text-gray-400">(One per line)</span>
          </label>
          <textarea
            rows={4}
            placeholder="Beginner Software Engineers&#10;Students wanting to learn React&#10;Career Switchers"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Price, Currency, Level & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Currency</label>
          <input
            type="text"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm uppercase focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Level</label>
          <input
            type="text"
            placeholder="e.g. Beginner, Advanced"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white font-semibold"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Duration, Number of Students, Rating & Order */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700">Duration</label>
          <input
            type="text"
            placeholder="e.g. 12 Hours, 6 Weeks"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Displayed Student Count</label>
          <input
            type="text"
            placeholder="e.g. 1,200+"
            value={formData.numberOfStudents}
            onChange={(e) => setFormData({ ...formData, numberOfStudents: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Rating Display</label>
          <input
            type="text"
            placeholder="e.g. 4.8"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Display Order</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Instructor Selection */}
      {instructors.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-700">Instructor</label>
          <select
            value={formData.instructorId}
            onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
            className="mt-1 w-full sm:w-1/2 rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">-- Select Instructor --</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Course Thumbnail Upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Course Thumbnail</label>
        {formData.thumbnail ? (
          <div className="relative aspect-video w-64 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            <Image
              src={formData.thumbnail}
              alt="Course Thumbnail"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 rounded-lg bg-rose-600 p-1.5 text-white hover:bg-rose-700 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <label className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer transition">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              ) : (
                <Upload className="w-4 h-4 text-gray-600" />
              )}
              <span>{uploading ? "Uploading Image..." : "Upload Thumbnail"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploadError && <p className="text-xs text-rose-600 mt-1">{uploadError}</p>}
          </div>
        )}
      </div>

      {/* Action Buttons */}
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
          disabled={loading || uploading}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}