"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Video, 
  FileText, 
  HelpCircle, 
  Paperclip, 
  Eye, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Plus, 
  Clock,
  Layers
} from "lucide-react";

interface LessonListProps {
  lessons: any[];
  batches: { id: string; title: string; status: string }[];
  courseId: string;
}

export default function LessonList({ lessons, batches, courseId }: LessonListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    setDeletingId(lessonId);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete lesson.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  if (lessons.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
        <Video className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-base font-semibold text-gray-900">No lessons created yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start adding video lectures, downloadable resources, and quizzes to your course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => {
        const durationMin = lesson.durationSeconds
          ? Math.round(lesson.durationSeconds / 60)
          : null;

        return (
          <div
            key={lesson.id}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 transition"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Main Information */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
                  #{lesson.order}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900">
                      {lesson.title}
                    </h3>

                    {lesson.isPreview && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Free Preview
                      </span>
                    )}

                    {lesson.batch ? (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                        <Layers className="w-3 h-3" />
                        {lesson.batch.title}
                      </span>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        Unassigned Batch
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-1">
                    {lesson.description || "No description provided."}
                  </p>

                  {/* Metadata Indicators */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                    {durationMin !== null && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{durationMin} min</span>
                      </div>
                    )}

                    {lesson.attachments?.length > 0 && (
                      <div className="flex items-center gap-1 text-amber-600 font-medium">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{lesson.attachments.length} files</span>
                      </div>
                    )}

                    {lesson.quiz && (
                      <div className="flex items-center gap-1 text-purple-600 font-medium">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Quiz: {lesson.quiz.title}</span>
                      </div>
                    )}

                    {lesson.notes && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lecture Notes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <Link
                  href={`/admin/courses/${courseId}/content/${lesson.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(lesson.id)}
                  disabled={deletingId === lesson.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}