// app/(root)/(userDashboard)/dashboard/courses/[slug]/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

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

type BatchItem = {
  id: string;
  title: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
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

  // Get all batches for this course
  const batchRows = await prisma.batch.findMany({
    where: {
      courseId: course.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Find if a batch is already attached/selected by the user
  const activeBatchId = accesses.find((access) => access.batchId !== null)?.batchId;

  // If user has access but hasn't selected a batch yet, show mandatory batch selection screen
  if (hasAccess && !activeBatchId) {
    return (
      <section className="py-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="mt-2 text-gray-600">
            You have access to this course! Please select your preferred batch below to access course content.
          </p>
        </div>

        {batchRows.length === 0 ? (
          <p className="text-gray-500">No batches available for this course yet.</p>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Available Batches</h2>
            {batchRows.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{batch.title}</h3>
                  <span className="inline-block mt-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {batch.status}
                  </span>
                  {(batch.startDate || batch.endDate) && (
                    <p className="mt-1 text-sm text-gray-500">
                      {batch.startDate && `Starts ${batch.startDate.toLocaleDateString()}`}
                      {batch.startDate && batch.endDate && " · "}
                      {batch.endDate && `Ends ${batch.endDate.toLocaleDateString()}`}
                    </p>
                  )}
                </div>

                <form action={selectBatchAction}>
                  <input type="hidden" name="batchId" value={batch.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
                  >
                    Select Batch
                  </button>
                </form>
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

  const batches: BatchItem[] = batchRows
    .filter((batch) => !activeBatchId || batch.id === activeBatchId)
    .map((batch) => ({
      id: batch.id,
      title: batch.title,
      status: batch.status,
      startDate: batch.startDate,
      endDate: batch.endDate,
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
    <section className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>

        {course.description && (
          <p className="mt-2 text-gray-500">{course.description}</p>
        )}

        {hasAccess && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Enrolled Batch Active
              </p>

              <p className="text-sm font-medium text-green-700">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm text-green-800">
                <span>Course Progress</span>
                <span>{progressPercentage}%</span>
              </div>

              <div className="h-3 w-full rounded-full bg-green-100">
                <div
                  className="h-3 rounded-full bg-green-600 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {hasAccess && totalLessons > 0 && progressPercentage === 100 && (
          <Link
            href={`/api/certificates/course/${course.id}`}
            className="mt-4 inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Download Certificate
          </Link>
        )}
      </div>

      {batches.length === 0 ? (
        <p className="text-gray-500">No batches or lessons available.</p>
      ) : (
        <div className="space-y-6">
          {batches.map((batch: BatchItem) => (
            <div
              key={batch.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {batch.title}
                </h2>

                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  {batch.status}
                </span>

                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Selected Batch
                </span>
              </div>

              {(batch.startDate || batch.endDate) && (
                <p className="mt-1 text-sm text-gray-500">
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
                <p className="mt-4 text-gray-500">No lessons in this batch.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {batch.lessons.map((lesson: LessonItem) => {
                    const isCompleted = lesson.progressRecords.some(
                      (progress) => progress.isCompleted
                    );

                    return (
                      <li
                        key={lesson.id}
                        className={`flex items-center justify-between rounded-xl border p-4 ${
                          isCompleted
                            ? "border-green-200 bg-green-50"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {lesson.title}
                            </p>

                            {isCompleted && (
                              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/dashboard/courses/${course.slug}/lessons/${lesson.slug}`}
                          className={`rounded-lg px-4 py-2 text-sm text-white ${
                            isCompleted
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-black hover:bg-gray-800"
                          }`}
                        >
                          Lesson Materials
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
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-yellow-700">
            You do not have access to this course. Please purchase to unlock all
            lessons.
          </p>
        </div>
      )}
    </section>
  );
}