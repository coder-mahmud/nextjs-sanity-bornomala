// app/(root)/(userDashboard)/dashboard/courses/[slug]/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ExternalLink, CheckCircle, Clock, User, Video, Users, Calendar } from "lucide-react";

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

type LessonItem = {
  id: string;
  title: string;
  slug: string;
  isPreview: boolean;
  progressRecords: { isCompleted: boolean }[];
};

type BatchItemFormatted = {
  id: string;
  title: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  scheduleText: string | null;
  meetingPlatform: string | null;
  meetingLink: string | null;
  maxStudents: number | null;
  instructor: {
    name: string;
    title: string | null;
    designation: string | null;
    imageUrl: string | null;
  } | null;
  lessons: LessonItem[];
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: {
      slug,
    },
  });

  if (!course) {
    return (
      <section className="py-8">
        <p className="text-red-500">Course not found.</p>
      </section>
    );
  }

  const now = new Date();

  // Check user course access
  const accesses = await prisma.courseAccess.findMany({
    where: {
      userId: user.id,
      courseId: course.id,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: {
      id: true,
      batchId: true,
    },
  });

  const hasAccess = accesses.length > 0;

  // Server Action to attach the selected batch to the user's access
  async function selectBatchAction(formData: FormData) {
    "use server";
    const selectedBatchId = formData.get("batchId") as string;
    if (!selectedBatchId) return;

    const accessToUpdate = await prisma.courseAccess.findFirst({
      where: {
        userId: user?.id,
        courseId: course?.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    if (accessToUpdate) {
      await prisma.courseAccess.update({
        where: { id: accessToUpdate.id },
        data: { batchId: selectedBatchId },
      });
    }

    redirect(`/dashboard/courses/${slug}`);
  }

  // Fetch batches with inferred typing to avoid payload mismatch
  const batchRows = await prisma.batch.findMany({
    where: {
      courseId: course.id,
    },
    include: {
      instructor: {
        select: {
          name: true,
          title: true,
          designation: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  }) as any[];

  // Find if a batch is already attached/selected by the user
  const activeBatchId = accesses.find((access) => access.batchId !== null)?.batchId;

  // If user has access but hasn't selected a batch yet, show batch selection screen with schedule & instructor details
  if (hasAccess && !activeBatchId) {
    return (
      <section className="py-8 max-w-3xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="mt-1 text-xs text-gray-600">
            You have enrolled in this course! Please choose your batch below to access class schedules and materials.
          </p>
        </div>

        {batchRows.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No batches available for this course yet.</p>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-800">Select Your Batch</h2>
            {batchRows.map((batch) => (
              <div
                key={batch.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 transition hover:border-gray-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{batch.title}</h3>
                      <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[11px] font-semibold">
                        {batch.status}
                      </span>
                    </div>

                    {(batch.startDate || batch.endDate) && (
                      <p className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {batch.startDate &&
                          `Starts: ${batch.startDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`}
                        {batch.startDate && batch.endDate && " — "}
                        {batch.endDate &&
                          `Ends: ${batch.endDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`}
                      </p>
                    )}
                  </div>

                  <form action={selectBatchAction}>
                    <input type="hidden" name="batchId" value={batch.id} />
                    <button
                      type="submit"
                      className="rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition cursor-pointer shadow-xs shrink-0"
                    >
                      Select This Batch →
                    </button>
                  </form>
                </div>

                {/* Batch Times Text Display */}
                {batch.scheduleText && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Class Schedule / Times
                    </span>
                    <p className="text-xs text-emerald-950 font-medium whitespace-pre-wrap">
                      {batch.scheduleText}
                    </p>
                  </div>
                )}

                {/* Additional Details Grid: Instructor & Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {/* Assigned Instructor */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-600 shrink-0">
                      {batch.instructor?.imageUrl ? (
                        <img
                          src={batch.instructor.imageUrl}
                          alt={batch.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">
                        Instructor
                      </span>
                      <p className="font-bold text-gray-800 truncate">
                        {batch.instructor?.name || "Instructor Unassigned"}
                      </p>
                      {batch.instructor?.title && (
                        <p className="text-[11px] text-gray-500 truncate">
                          {batch.instructor.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Class Platform & Capacity */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">
                      Batch Details
                    </span>
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-blue-600" />
                        Platform:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {batch.meetingPlatform || "Online / Recorded"}
                      </span>
                    </div>
                    {batch.maxStudents && (
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          Capacity:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {batch.maxStudents} Students Max
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // If a batch is selected, load lessons for that active batch
  const targetBatchIds = activeBatchId ? [activeBatchId] : batchRows.map((b) => b.id);

  const lessonRows =
    targetBatchIds.length === 0
      ? []
      : await prisma.lesson.findMany({
          where: {
            batchId: { in: targetBatchIds },
          },
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
            slug: true,
            isPreview: true,
            batchId: true,
          },
        });

  const progressRows =
    lessonRows.length === 0
      ? []
      : await prisma.lessonProgress.findMany({
          where: {
            userId: user.id,
            lessonId: { in: lessonRows.map((lesson) => lesson.id) },
          },
          select: {
            lessonId: true,
            isCompleted: true,
          },
        });

  const completedLessonIds = new Set<string>();
  for (const row of progressRows) {
    if (row.isCompleted) {
      completedLessonIds.add(row.lessonId);
    }
  }

  const lessonsByBatch = new Map<string, LessonItem[]>();
  for (const lesson of lessonRows) {
    if (!lesson.batchId) continue;

    const item: LessonItem = {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      isPreview: lesson.isPreview,
      progressRecords: completedLessonIds.has(lesson.id)
        ? [{ isCompleted: true }]
        : [],
    };

    const list = lessonsByBatch.get(lesson.batchId) ?? [];
    list.push(item);
    lessonsByBatch.set(lesson.batchId, list);
  }

  const batches: BatchItemFormatted[] = batchRows
    .filter((batch) => !activeBatchId || batch.id === activeBatchId)
    .map((batch) => ({
      id: batch.id,
      title: batch.title,
      status: batch.status,
      startDate: batch.startDate,
      endDate: batch.endDate,
      scheduleText: batch.scheduleText,
      meetingPlatform: batch.meetingPlatform,
      meetingLink: batch.meetingLink,
      maxStudents: batch.maxStudents,
      instructor: batch.instructor,
      lessons: lessonsByBatch.get(batch.id) ?? [],
    }));

  const accessibleLessons = batches.flatMap((batch) => batch.lessons);
  const totalLessons = accessibleLessons.length;
  const completedLessons = accessibleLessons.filter((lesson) =>
    lesson.progressRecords.some((progress) => progress.isCompleted)
  ).length;

  const progressPercentage =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <section className="py-8 space-y-6 max-w-4xl mx-auto px-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          {course.tagLine && (
            <p className="text-sm font-semibold text-emerald-700 mt-1">{course.tagLine}</p>
          )}
        </div>

        {course.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
        )}

        {/* Course Book Section */}
        {course.courseBook && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-blue-900">Recommended Course Book</h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  Lesson book is available for this course. Buy from Amazon link
                </p>
              </div>
            </div>

            <a
              href={course.courseBook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition shrink-0 shadow-xs"
            >
              <span>Buy from Amazon</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {hasAccess && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Enrolled Batch Active
              </p>

              <p className="text-xs font-medium text-green-700">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs text-green-800 font-medium">
                <span>Course Progress</span>
                <span>{progressPercentage}%</span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-green-100 overflow-hidden">
                <div
                  className="h-2.5 rounded-full bg-green-600 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {hasAccess && totalLessons > 0 && progressPercentage === 100 && (
          <div>
            <Link
              href={`/api/certificates/course/${course.id}`}
              className="inline-flex rounded-xl bg-green-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-green-700 transition shadow-xs"
            >
              Download Certificate
            </Link>
          </div>
        )}
      </div>

      {batches.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No batches or lessons available.</p>
      ) : (
        <div className="space-y-6">
          {batches.map((batch: BatchItemFormatted) => (
            <div
              key={batch.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {batch.title}
                </h2>

                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {batch.status}
                </span>

                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Selected Batch
                </span>
              </div>

              {batch.scheduleText && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Class Schedule / Times
                  </span>
                  <p className="text-xs text-emerald-950 font-medium whitespace-pre-wrap">
                    {batch.scheduleText}
                  </p>
                </div>
              )}

              {(batch.startDate || batch.endDate) && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {batch.startDate &&
                    `Starts ${batch.startDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}`}
                  {batch.startDate && batch.endDate && " · "}
                  {batch.endDate &&
                    `Ends ${batch.endDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}`}
                </p>
              )}

              {batch.lessons.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No lessons in this batch.</p>
              ) : (
                <ul className="space-y-3">
                  {batch.lessons.map((lesson: LessonItem) => {
                    const isCompleted = lesson.progressRecords.some(
                      (progress) => progress.isCompleted
                    );

                    return (
                      <li
                        key={lesson.id}
                        className={`flex items-center justify-between rounded-xl border p-4 transition ${
                          isCompleted
                            ? "border-green-200 bg-green-50/50"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold text-gray-900">
                              {lesson.title}
                            </p>

                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                <CheckCircle className="w-3 h-3" /> Completed
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/dashboard/courses/${course.slug}/lessons/${lesson.slug}`}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition ${
                            isCompleted
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-black hover:bg-gray-800"
                          }`}
                        >
                          Lesson Materials →
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasAccess && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-xs">
          <p className="text-xs font-medium text-yellow-800">
            You do not have access to this course. Please purchase to unlock all lessons.
          </p>
        </div>
      )}
    </section>
  );
}