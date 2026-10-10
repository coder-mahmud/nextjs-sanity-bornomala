"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createCourse } from "../actions";
import CloudinaryUpload from "@/lib/CloudinaryUpload";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface InstructorOption {
  id: string;
  name: string;
  title: string | null;
}

export interface ScheduleOption {
  id: string;
  level: string | null;
  description: string | null;
  branch: {
    name: string;
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

interface CourseCardItem {
  title: string;
  description: string;
  image: string;
  order: number;
}

interface CreateCourseFormProps {
  instructors: InstructorOption[];
  schedules: ScheduleOption[];
  cloudName: string;
  uploadPreset: string;
}

function TiptapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-gray-300 p-2 focus-within:border-blue-500">
      <div className="flex gap-2 border-b border-gray-200 pb-2 mb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-xs rounded ${
            editor.isActive("bold") ? "bg-gray-200 font-bold" : "bg-gray-100"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-xs rounded ${
            editor.isActive("italic") ? "bg-gray-200 italic" : "bg-gray-100"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-xs rounded ${
            editor.isActive("bulletList") ? "bg-gray-200" : "bg-gray-100"
          }`}
        >
          Bullet List
        </button>
      </div>
      <EditorContent editor={editor} className="min-h-[100px] prose text-sm" />
    </div>
  );
}

export default function CreateCourseForm({
  instructors,
  schedules,
  cloudName,
  uploadPreset,
}: CreateCourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [faqs, setFaqs] = useState<FAQItem[]>([{ question: "", answer: "" }]);
  const [cards, setCards] = useState<CourseCardItem[]>([
    { title: "", description: "", image: "", order: 0 },
  ]);

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleAddCard = () => {
    setCards([...cards, { title: "", description: "", image: "", order: cards.length }]);
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (
    index: number,
    field: keyof CourseCardItem,
    value: string | number
  ) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Grab the latest Cloudinary image URLs from the hidden inputs for each card
    const processedCards = cards.map((card, index) => {
      let imageUrl = card.image;
      if (formRef.current) {
        const hiddenInput = formRef.current.querySelector(
          `input[name="cardImage_${index}"]`
        ) as HTMLInputElement;
        if (hiddenInput && hiddenInput.value) {
          imageUrl = hiddenInput.value;
        }
      }
      return {
        ...card,
        image: imageUrl,
      };
    });

    formData.append("faqs", JSON.stringify(faqs.filter((f) => f.question.trim())));
    formData.append("cards", JSON.stringify(processedCards.filter((c) => c.title.trim())));

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
      ref={formRef}
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

      {/* Schedule Selection */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Paris Schedule
          </label>
          <select
            name="parisScheduleId"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Paris Schedule (Optional)</option>
            {schedules.map((sched) => (
              <option key={sched.id} value={sched.id}>
                {sched.level ? `${sched.level}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hoche Schedule
          </label>
          <select
            name="hocheScheduleId"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Hoche Schedule (Optional)</option>
            {schedules.map((sched) => (
              <option key={sched.id} value={sched.id}>
                {sched.level ? `${sched.level}` : ""}
              </option>
            ))}
          </select>
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

      {/* Course Cards Section with Cloudinary Upload */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Cards</h3>
        <div className="space-y-4">
          {cards.map((card, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Card #{index + 1}</span>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(index)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => handleCardChange(index, "title", e.target.value)}
                  placeholder="Card Title *"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 bg-white"
                />
                <input
                  type="number"
                  value={card.order}
                  onChange={(e) => handleCardChange(index, "order", parseInt(e.target.value) || 0)}
                  placeholder="Display Order"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 bg-white"
                />
              </div>

              {/* Cloudinary Image Upload for Card */}
              <div>
                <CloudinaryUpload
                  name={`cardImage_${index}`}
                  label="Card Image"
                  defaultValue={card.image}
                  cloudName={cloudName}
                  uploadPreset={uploadPreset}
                  folder="course-cards"
                />
              </div>

              <textarea
                value={card.description}
                onChange={(e) => handleCardChange(index, "description", e.target.value)}
                placeholder="Card Description"
                rows={2}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 bg-white"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddCard}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            + Add Course Card
          </button>
        </div>
      </div>

      {/* Course FAQs Section with Tiptap */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course FAQs</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">FAQ #{index + 1}</span>
                {faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(index)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                placeholder="Question"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 bg-white"
              />
              <TiptapEditor
                value={faq.answer}
                onChange={(html) => handleFaqChange(index, "answer", html)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddFaq}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            + Add FAQ
          </button>
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