// app/admin/courses/[courseId]/edit/EditCourseForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateCourse } from "../../actions";
import { toast } from "react-toastify";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CloudinaryUpload from "@/lib/CloudinaryUpload";

interface InstructorOption {
  id: string;
  name: string;
  title?: string | null;
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

interface EditCourseFormProps {
  course: any;
  instructors?: InstructorOption[];
  schedules?: ScheduleOption[];
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

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-gray-300 p-2 focus-within:border-blue-500 bg-white">
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
      <EditorContent editor={editor} className="min-h-[100px] prose text-sm max-w-none focus:outline-none" />
    </div>
  );
}

export default function EditCourseForm({
  course,
  instructors = [],
  schedules = [],
  cloudName,
  uploadPreset,
}: EditCourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize selected instructors from course relation or legacy field
  const initialInstructorIds: string[] = Array.isArray(course.instructors)
    ? course.instructors.map((i: any) => i.id)
    : course.instructorId
    ? [course.instructorId]
    : [];

  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(initialInstructorIds);

  const initialFaqs: FAQItem[] = Array.isArray(course.faqs)
    ? course.faqs
    : [{ question: "", answer: "" }];

  const [faqs, setFaqs] = useState<FAQItem[]>(
    initialFaqs.length > 0 ? initialFaqs : [{ question: "", answer: "" }]
  );

  const initialCards: CourseCardItem[] = Array.isArray(course.cards)
    ? course.cards.map((c: any, index: number) => ({
        title: c.title || "",
        description: c.description || "",
        image: c.image || "",
        order: c.order ?? index,
      }))
    : [];

  const [cards, setCards] = useState<CourseCardItem[]>(initialCards);

  const [formData, setFormData] = useState({
    title: course.title || "",
    slug: course.slug || "",
    tagLine: course.tagLine || "",
    shortDescription: course.shortDescription || "",
    description: course.description || "",
    courseBook: course.courseBook || "",
    courseVideo: course.courseVideo || "",
    isExamCivique: course.isExamCivique || false,
    price: course.price?.toString() || "0",
    currency: course.currency || "EUR",
    level: course.level || "Beginner",
    status: course.status || "DRAFT",
    courseType: course.courseType || "ONLINE",
    duration: course.duration || "",
    numberOfStudents: course.numberOfStudents || "",
    rating: course.rating || "",
    parisScheduleId: course.parisScheduleId || "",
    hocheScheduleId: course.hocheScheduleId || "",
    order: course.order?.toString() || "0",
    characteristics: Array.isArray(course.characteristics)
      ? course.characteristics.join("\n")
      : "",
    targetAudience: Array.isArray(course.targetAudience)
      ? course.targetAudience.join("\n")
      : "",
    thumbnail: course.thumbnail || "",
  });

  const handleInstructorToggle = (id: string) => {
    setSelectedInstructors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("slug", formData.slug);
    payload.append("tagLine", formData.tagLine);
    payload.append("shortDescription", formData.shortDescription);
    payload.append("description", formData.description);
    payload.append("courseBook", formData.courseBook);
    payload.append("courseVideo", formData.courseVideo);
    if (formData.isExamCivique) payload.append("isExamCivique", "on");
    payload.append("price", formData.price);
    payload.append("currency", formData.currency);
    payload.append("level", formData.level);
    payload.append("status", formData.status);
    payload.append("courseType", formData.courseType);
    payload.append("duration", formData.duration);
    payload.append("numberOfStudents", formData.numberOfStudents);
    payload.append("rating", formData.rating);
    payload.append("parisScheduleId", formData.parisScheduleId);
    payload.append("hocheScheduleId", formData.hocheScheduleId);
    payload.append("order", formData.order);
    payload.append("characteristics", formData.characteristics);
    payload.append("targetAudience", formData.targetAudience);

    // Grab thumbnail URL from CloudinaryUpload component if rendered via ref or hidden inputs,
    // or fallback to state.
    let thumbnailUrl = formData.thumbnail;
    if (formRef.current) {
      const thumbInput = formRef.current.querySelector('input[name="thumbnail"]') as HTMLInputElement;
      if (thumbInput && thumbInput.value) {
        thumbnailUrl = thumbInput.value;
      }
    }
    payload.append("thumbnail", thumbnailUrl);

    // Attach multiple instructors
    payload.append("instructorIds", JSON.stringify(selectedInstructors));

    const filteredFaqs = faqs.filter((f) => f.question.trim());
    payload.append("faqs", JSON.stringify(filteredFaqs));

    // Extract dynamic Cloudinary images from hidden inputs for course cards
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

    payload.append("cards", JSON.stringify(processedCards.filter((c) => c.title.trim())));

    toast.promise(
      async () => {
        const res = await updateCourse(course.id, payload);
        if (!res?.success) {
          throw new Error(res?.message || "Failed to update course.");
        }
        return res;
      },
      {
        pending: "Updating course...",
        success: "Course updated successfully!",
        error: {
          render({ data }: { data: any }) {
            return data?.message || "Failed to update course.";
          },
        },
      }
    )
    .then((res) => {
      if (res?.success) {
        router.push(`/admin/courses/${course.id}`);
        router.refresh();
      }
    })
    .catch((err) => {
      console.error("Course update error:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Slug */}
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
          <label className="block text-xs font-semibold text-gray-700">Course Slug *</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none font-mono text-gray-800"
          />
        </div>
      </div>

      {/* Tagline & Short Description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Course Video (YouTube Link) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700">Course Video (YouTube Link)</label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={formData.courseVideo}
          onChange={(e) => setFormData({ ...formData, courseVideo: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Course Book Amazon Link */}
      <div>
        <label className="block text-xs font-semibold text-gray-700">Course Book (Amazon Link)</label>
        <input
          type="url"
          placeholder="https://amazon.com/dp/..."
          value={formData.courseBook}
          onChange={(e) => setFormData({ ...formData, courseBook: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Cloudinary Thumbnail Upload */}
      <div>
        <CloudinaryUpload
          name="thumbnail"
          label="Course Thumbnail"
          defaultValue={formData.thumbnail}
          cloudName={cloudName}
          uploadPreset={uploadPreset}
          folder="courses"
        />
      </div>

      {/* Price, Currency, Level, Course Type & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white font-semibold"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Course Type</label>
          <select
            value={formData.courseType}
            onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white font-semibold"
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
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

      {/* Is Exam Civique Checkbox */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
        <input
          type="checkbox"
          id="isExamCivique"
          checked={formData.isExamCivique}
          onChange={(e) => setFormData({ ...formData, isExamCivique: e.target.checked })}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="isExamCivique"
          className="text-sm font-semibold text-gray-800 cursor-pointer select-none"
        >
          Is Exam Civique?
        </label>
      </div>

      {/* Schedules (Paris & Hoche) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700">Paris Schedule</label>
          <select
            value={formData.parisScheduleId}
            onChange={(e) => setFormData({ ...formData, parisScheduleId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">-- Select Paris Schedule --</option>
            {schedules.map((sched) => (
              <option key={sched.id} value={sched.id}>
                {sched.level ? `${sched.level}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Hoche Schedule</label>
          <select
            value={formData.hocheScheduleId}
            onChange={(e) => setFormData({ ...formData, hocheScheduleId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">-- Select Hoche Schedule --</option>
            {schedules.map((sched) => (
              <option key={sched.id} value={sched.id}>
                {sched.level ? `${sched.level}` : ""}
              </option>
            ))}
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

      {/* Multiple Instructors Checkbox Selection */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
        <label className="block text-xs font-semibold text-gray-800">
          Instructors (Select Multiple)
        </label>
        {instructors.length === 0 ? (
          <p className="text-xs text-gray-500">No instructors found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
            {instructors.map((instructor) => {
              const isChecked = selectedInstructors.includes(instructor.id);
              return (
                <label
                  key={instructor.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition text-xs ${
                    isChecked ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleInstructorToggle(instructor.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="font-medium text-gray-800">
                    {instructor.name}
                    {instructor.title ? ` (${instructor.title})` : ""}
                  </span>
                </label>
              );
            })}
          </div>
        )}
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

      {/* Course Cards Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Course Cards</h3>
        <div className="space-y-4">
          {cards.map((card, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">Card #{index + 1}</span>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(index)}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
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
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                />
                <input
                  type="number"
                  value={card.order}
                  onChange={(e) => handleCardChange(index, "order", parseInt(e.target.value) || 0)}
                  placeholder="Display Order"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                />
              </div>

              {/* Cloudinary Upload for Card Image */}
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
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddCard}
            className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
          >
            + Add Course Card
          </button>
        </div>
      </div>

      {/* Course FAQs Section with Tiptap */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Course FAQs</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">FAQ #{index + 1}</span>
                {faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(index)}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
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
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
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
            className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
          >
            + Add FAQ
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}