import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Video,
  FileText,
  HelpCircle,
  Calendar,
  Edit,
  Eye,
  CheckCircle2,
  Paperclip,
  Download,
  Clapperboard,
} from "lucide-react";

type LessonWithRelations = Prisma.LessonGetPayload<{
  include: {
    batch: {
      include: {
        course: { select: { id: true; title: true } };
      };
    };
    quiz: {
      include: {
        questions: true;
      };
    };
    progressRecords: {
      include: {
        user: { select: { id: true; name: true; email: true } };
      };
    };
  };
}>;

interface LessonDetailsPageProps {
  params: Promise<{
    courseId: string;
    batchId: string;
    lessonId: string;
  }>;
}

export default async function LessonDetailsPage({ params }: LessonDetailsPageProps) {
  const { courseId, batchId, lessonId } = await params;

  const lesson = (await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      batchId: batchId,
    },
    include: {
      batch: {
        include: {
          course: { select: { id: true, title: true } },
        },
      },
      quiz: {
        include: {
          questions: true,
        },
      },
      progressRecords: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })) as LessonWithRelations | null;

  if (!lesson) {
    notFound();
  }

  const completedCount = lesson.progressRecords.filter((p) => p.isCompleted).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Breadcrumb */}
      <div>
        <Link
          href={`/admin/courses/${courseId}/content/batches/${batchId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition mb-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to {lesson.batch?.title || "Batch"}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              {lesson.isPreview && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Free Preview
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Course: <span className="font-semibold text-gray-700">{lesson.batch?.course?.title}</span> •
              Batch: <span className="font-semibold text-gray-700">{lesson.batch?.title}</span> •
              Order: <span className="font-mono">#{lesson.order}</span> •
              Slug: <span className="font-mono">/{lesson.slug}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/courses/${courseId}/content/batches/${batchId}/${lessonId}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Lesson
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Schedule Window</p>
            <p className="text-xs font-semibold text-gray-800 mt-0.5">
              {lesson.startsAt ? new Date(lesson.startsAt).toLocaleDateString() : "Immediate"} -{" "}
              {lesson.endsAt ? new Date(lesson.endsAt).toLocaleDateString() : "No Limit"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Completions</p>
            <p className="text-lg font-bold text-gray-900">{completedCount} Students</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Attached Quiz</p>
            <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate max-w-[180px]">
              {lesson.quiz ? lesson.quiz.title : "None Attached"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Video, Notes & Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Section */}
          {lesson.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-2">
              <h3 className="font-bold text-sm text-gray-900">Description</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{lesson.description}</p>
            </div>
          )}

          {/* Video Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
              <Video className="w-4 h-4 text-indigo-600" />
              Lesson Video
            </div>
            {lesson.videoUrl ? (
              <div className="space-y-2">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-gray-400 font-mono break-all">
                  URL: {lesson.videoUrl}
                </p>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
                No video link provided for this lesson.
              </div>
            )}
          </div>

          {/* Bunny Stream Integration Info */}
          {(lesson.bunnyLibraryId || lesson.bunnyVideoId) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                <Clapperboard className="w-4 h-4 text-orange-600" />
                Bunny Stream Integration
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block font-medium">Library ID</span>
                  <span className="font-mono text-gray-800 font-semibold">{lesson.bunnyLibraryId || "N/A"}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block font-medium">Video ID</span>
                  <span className="font-mono text-gray-800 font-semibold">{lesson.bunnyVideoId || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Lecture Notes Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-indigo-600" />
              Lecture Notes
            </div>
            {lesson.notes ? (
              <div className="prose prose-sm text-gray-700 text-xs leading-relaxed max-w-none whitespace-pre-wrap">
                {lesson.notes}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No notes created for this lesson.</p>
            )}
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
              <Paperclip className="w-4 h-4 text-indigo-600" />
              Attachments & Downloads ({lesson.attachments.length})
            </div>
            {lesson.attachments.length > 0 ? (
              <div className="space-y-2">
                {lesson.attachments.map((fileUrl, index) => (
                  <a
                    key={index}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-100 text-xs transition"
                  >
                    <span className="font-mono text-gray-700 truncate max-w-md">{fileUrl}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
                      <Download className="w-3.5 h-3.5" /> Download
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No attachments added.</p>
            )}
          </div>
        </div>

        {/* Right Column: Quiz Info & Student Progress */}
        <div className="space-y-6">
          {/* Linked Quiz Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600" /> Linked Quiz
            </h3>
            {lesson.quiz ? (
              <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 space-y-2">
                <p className="text-xs font-semibold text-purple-950">{lesson.quiz.title}</p>
                <div className="flex items-center justify-between text-[11px] text-purple-700">
                  <span>Questions: {lesson.quiz.questions?.length || 0}</span>
                  <span>Duration: {lesson.quiz.durationMinutes} mins</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No quiz linked to this lesson.</p>
            )}
          </div>

          {/* Student Progress Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" /> Recent Student Activity
            </h3>
            {lesson.progressRecords.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {lesson.progressRecords.map((record) => (
                  <div key={record.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-gray-800">
                        {record.user?.name || "Unknown Student"}
                      </p>
                      <p className="text-[10px] text-gray-400">{record.user?.email}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        record.isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {record.isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No student progress recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}