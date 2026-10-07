"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createCourse } from "../actions";
import CloudinaryUpload from "@/lib/CloudinaryUpload";

interface InstructorOption {
  id: string;
  name: string;
  title: string | null;
}

interface CreateCourseFormProps {
  instructors: InstructorOption[];
  cloudName: string;
  uploadPreset: string;
}

export default function CreateCourseForm({
  instructors,
  cloudName,
  uploadPreset,
}: CreateCourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    toast
      .promise(createCourse(formData), {
        pending: "Creating course...",
        success: "Course created successfully!",
        error: "Failed to create course",
      })
      .then((res) => {
        if (res?.success) {
          router.push("/admin/courses");
          router.refresh();
        }
      })
      .catch((err) => {
        console.error("Course creation error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          name="title"
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Complete JavaScript Course"
        />
      </div>

      {/* Tagline */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tagline
        </label>
        <input
          type="text"
          name="tagLine"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Master modern JavaScript from scratch"
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          rows={2}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder="A concise summary of the course."
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Full Description
        </label>
        <textarea
          name="description"
          rows={6}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Detailed course description."
        />
      </div>

      {/* Cloudinary Thumbnail Upload */}
      <div>
        <CloudinaryUpload
          name="thumbnail"
          label="Course Thumbnail"
          cloudName={cloudName}
          uploadPreset={uploadPreset}
          folder="courses"
        />
      </div>

      {/* Price */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Price *
        </label>
        <input
          type="number"
          step="0.01"
          name="price"
          required
          defaultValue="0"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {/* Level & Duration */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Level
          </label>
          <select
            name="level"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Duration
          </label>
          <input
            type="text"
            name="duration"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="e.g. 10 Hours or 4 Weeks"
          />
        </div>
      </div>

      {/* Student Count & Rating */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Number of Students
          </label>
          <input
            type="text"
            name="numberOfStudents"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="e.g. 1,250+"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Rating
          </label>
          <input
            type="text"
            name="rating"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="e.g. 4.8"
          />
        </div>
      </div>

      {/* Instructor, Display Order & Status */}
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Instructor
          </label>
          <select
            name="instructorId"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Instructor (Optional)</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name}
                {instructor.title ? ` (${instructor.title})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="e.g. 1"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            defaultValue="DRAFT"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Characteristics */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Characteristics (One per line)
        </label>
        <textarea
          name="characteristics"
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder={
            "Self-paced learning\nHands-on projects\nCertificate on completion"
          }
        />
      </div>

      {/* Target Audience */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Target Audience (One per line)
        </label>
        <textarea
          name="targetAudience"
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder={
            "Beginner developers\nComputer Science students\nSelf-taught programmers"
          }
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#118F6B] px-6 py-3 font-semibold text-white hover:bg-[#355048] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Course..." : "Create Course"}
        </button>
      </div>
    </form>
  );
}