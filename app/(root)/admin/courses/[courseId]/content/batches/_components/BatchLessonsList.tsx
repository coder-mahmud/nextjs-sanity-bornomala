"use client";

import { Video, FileText, Paperclip, HelpCircle, Eye, Trash2, CalendarClock } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { deleteLesson } from "@/app/(root)/admin/courses/actions";
import { Prisma } from "@/prisma/generated/prisma/client";
import DeleteLessonModal from "./DeleteLessonModal";


export type LessonWithRelations = Prisma.LessonGetPayload<{
  include: {
    quiz: { select: { id: true; title: true } };
    _count: { select: { progressRecords: true } };
  };
}>;

interface BatchLessonsListProps {
  lessons: LessonWithRelations[];
  courseId: string;
  batchId: string;
}

export default function BatchLessonsList({ lessons, courseId, batchId }: BatchLessonsListProps) {
  const router = useRouter();

  const handleDelete = async (lessonId: string) => {

  };

  if (lessons.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center bg-white">
        <p className="text-sm font-medium text-gray-500">No lessons created for this batch yet.</p>
        <p className="text-xs text-gray-400 mt-1">Click "Add Lesson" above to add content to this batch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 transition"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 border border-blue-100">
              #{lesson.order}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900 text-sm">{lesson.title}</h4>
                {lesson.isPreview && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                    <Eye className="w-3 h-3" /> Free Preview
                  </span>
                )}
              </div>

              {lesson.description && (
                <p className="text-xs text-gray-500 line-clamp-1">{lesson.description}</p>
              )}

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                {(lesson.videoUrl || lesson.bunnyVideoId) && (
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <Video className="w-3.5 h-3.5 text-blue-500" /> Video Included
                  </span>
                )}

                {lesson.notes && (
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <FileText className="w-3.5 h-3.5 text-gray-500" /> Lecture Notes
                  </span>
                )}

                {lesson.attachments.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <Paperclip className="w-3.5 h-3.5 text-amber-500" /> {lesson.attachments.length} Attachment(s)
                  </span>
                )}

                {lesson.quiz && (
                  <span className="inline-flex items-center gap-1 text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    <HelpCircle className="w-3.5 h-3.5" /> Quiz: {lesson.quiz.title}
                  </span>
                )}

                {(lesson.startsAt || lesson.endsAt) && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <CalendarClock className="w-3.5 h-3.5 text-indigo-500" />
                    {lesson.startsAt ? new Date(lesson.startsAt).toLocaleDateString() : "Now"} -{" "}
                    {lesson.endsAt ? new Date(lesson.endsAt).toLocaleDateString() : "Forever"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
            <button
              onClick={() => handleDelete(lesson.id)}
              className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition"
              title="Delete Lesson"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}