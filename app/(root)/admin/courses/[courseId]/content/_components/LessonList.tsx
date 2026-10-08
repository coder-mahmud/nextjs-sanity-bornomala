"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, FileText } from "lucide-react";
import Link from "next/link";
import DeleteLessonModal from "./DeleteLessonModal";

interface LessonListProps {
  lessons: any[];
  batches: any[];
  courseId: string;
}

export default function LessonList({ lessons, courseId }: LessonListProps) {
  const router = useRouter();
  const [selectedLesson, setSelectedLesson] = useState<{ id: string; title: string } | null>(null);

  if (lessons.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-gray-500 border border-dashed rounded-xl">
        No lessons found for this course yet.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2 text-gray-600 font-mono text-xs font-bold">
                #{lesson.order}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{lesson.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {lesson.batch && (
                    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      {lesson.batch.title}
                    </span>
                  )}
                  {lesson.quiz && (
                    <span className="inline-block rounded bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                      Quiz: {lesson.quiz.title}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/courses/${courseId}/content/${lesson.id}/edit`}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Edit className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedLesson({ id: lesson.id, title: lesson.title })}
                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedLesson && (
        <DeleteLessonModal
          isOpen={Boolean(selectedLesson)}
          onClose={() => setSelectedLesson(null)}
          lessonId={selectedLesson.id}
          lessonTitle={selectedLesson.title}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}