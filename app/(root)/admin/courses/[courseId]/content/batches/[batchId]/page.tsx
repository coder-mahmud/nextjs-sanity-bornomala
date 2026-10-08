import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  Video,
  Users,
  BookOpen,
  ExternalLink,
  Lock,
  Globe,
} from "lucide-react";
import CreateLessonModalButton from "../_components/CreateLessonModalButton";
import LessonList from "../_components/LessonList";
import EditBatchModal from "../_components/EditBatchModal";

// Define explicit return payload type from Prisma
type BatchWithRelations = Prisma.BatchGetPayload<{
  include: {
    course: { select: { id: true; title: true } };
    lessons: {
      include: {
        quiz: { select: { id: true; title: true } };
        _count: { select: { progressRecords: true } };
      };
    };
    _count: { select: { accesses: true } };
  };
}>;

interface BatchDetailsPageProps {
  params: Promise<{
    courseId: string;
    batchId: string;
  }>;
}

export default async function BatchDetailsPage({ params }: BatchDetailsPageProps) {
  const { courseId, batchId } = await params;

  const batch = (await prisma.batch.findUnique({
    where: { id: batchId, courseId },
    include: {
      course: {
        select: { id: true, title: true },
      },
      lessons: {
        include: {
          quiz: { select: { id: true, title: true } },
          _count: { select: { progressRecords: true } },
        },
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          accesses: true,
        },
      },
    },
  })) as BatchWithRelations | null;

  if (!batch) {
    notFound();
  }

  // Fetch available quizzes for the lesson creation modal
  const unlinkedQuizzes = await prisma.quiz.findMany({
    select: { id: true, title: true },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Header */}
      <div>
        <Link
          href={`/admin/courses/${courseId}/content`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition mb-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Batches
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{batch.title}</h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {batch.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Course: <span className="font-semibold text-gray-700">{batch.course.title}</span> • Slug: <span className="font-mono">/{batch.slug}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <EditBatchModal batch={batch} />
            <CreateLessonModalButton
              courseId={courseId}
              batches={[{ id: batch.id, title: batch.title }]}
              quizzes={unlinkedQuizzes}
            />
          </div>
        </div>
      </div>

      {/* Batch Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Lessons</p>
            <p className="text-lg font-bold text-gray-900">{batch.lessons.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Enrolled Students</p>
            <p className="text-lg font-bold text-gray-900">
              {batch._count.accesses} {batch.maxStudents ? `/ ${batch.maxStudents}` : "(Unlimited)"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Batch Schedule</p>
            <p className="text-xs font-semibold text-gray-800 mt-0.5">
              {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "TBD"} -{" "}
              {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "TBD"}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Live Meeting Details Banner */}
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Video className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Live Meeting Information</h2>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            {batch.meetingPlatform || "Unassigned Platform"}
          </span>
        </div>

        {batch.meetingLink ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-gray-400 font-medium flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Platform
              </p>
              <p className="font-semibold text-gray-800">{batch.meetingPlatform || "Generic Stream"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-400 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Meeting Passcode
              </p>
              <p className="font-mono font-bold text-gray-800">
                {batch.meetingPassword || "None set"}
              </p>
            </div>

            <div className="flex items-center justify-end">
              <a
                href={batch.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-sm"
              >
                Launch Class <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-500 font-medium">No meeting link configured for this batch.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Click <span className="font-semibold text-gray-700">"Edit Batch Info"</span> above to set up Zoom or Google Meet URLs.
            </p>
          </div>
        )}
      </div>

      {/* Lessons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-bold text-gray-900">Batch Curriculum & Lessons</h2>
          <span className="text-xs text-gray-400">{batch.lessons.length} Lessons</span>
        </div>

        <LessonList lessons={batch.lessons} courseId={courseId} batchId={batch.id} />
      </div>
    </div>
  );
}