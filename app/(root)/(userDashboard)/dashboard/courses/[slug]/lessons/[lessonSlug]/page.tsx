// app/dashboard/courses/[slug]/lessons/[lessonSlug]/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SecureBunnyPlayer from "@/components/courses/SecureBunnyPlayer";

interface LessonPageProps {
  params: Promise<{
    slug: string;
    lessonSlug: string;
  }>;
}

async function markLessonCompleted(formData: FormData) {
  "use server";

  const lessonId = formData.get("lessonId") as string;
  const courseSlug = formData.get("courseSlug") as string;
  const lessonSlug = formData.get("lessonSlug") as string;

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/login");
  }

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  redirect(`/dashboard/courses/${courseSlug}/lessons/${lessonSlug}`);
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/login");
  }

  /*
   * 1. Lesson (plain scalar fields only)
   */
  const lesson = await prisma.lesson.findUnique({
    where: { slug: lessonSlug },
  });

  if (!lesson || !lesson.batchId) {
    redirect("/dashboard/courses");
  }

  /*
   * 2. Batch (plain scalar fields only, no `include`).
   */
  const batch = await prisma.batch.findUnique({
    where: { id: lesson.batchId },
  });

  if (!batch) {
    redirect("/dashboard/courses");
  }

  /*
   * 3. Course, loaded separately via batch.courseId
   */
  const course = await prisma.course.findUnique({
    where: { id: batch.courseId },
  });

  if (!course) {
    redirect("/dashboard/courses");
  }

  /*
   * 4. All lessons in this batch, loaded separately via batch.id
   */
  const batchLessons = await prisma.lesson.findMany({
    where: { batchId: batch.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
    },
  });

  /*
   * Make sure the URL course slug matches the actual course.
   */
  if (course.slug !== slug) {
    redirect(`/dashboard/courses/${course.slug}/lessons/${lesson.slug}`);
  }

  /*
   * Check whether the current user has access to the course.
   */
  const access = await prisma.courseAccess.findFirst({
    where: {
      userId: user.id,
      courseId: course.id,
    },
  });

  const hasAccess = !!access || lesson.isPreview;

  if (!hasAccess) {
    return (
      <section className="py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-red-600">
            You do not have access to this lesson. Please purchase the
            course.
          </p>

          <Link
            href={`/video-courses/${course.slug}`}
            className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            View Course
          </Link>
        </div>
      </section>
    );
  }

  /*
   * Make sure a progress record exists.
   */
  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lesson.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      lessonId: lesson.id,
    },
  });

  const isCompleted = progress.isCompleted === true;

  /*
   * Previous and next lessons in this batch.
   */
  const lessonIndex = batchLessons.findIndex((item) => item.id === lesson.id);

  const prevLesson = lessonIndex > 0 ? batchLessons[lessonIndex - 1] : null;

  const nextLesson =
    lessonIndex >= 0 && lessonIndex < batchLessons.length - 1
      ? batchLessons[lessonIndex + 1]
      : null;

  return (
    <section className="py-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/courses/${course.slug}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to course
        </Link>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lesson.title}
            </h1>

            {lesson.description && (
              <p className="mt-2 text-gray-500">{lesson.description}</p>
            )}
          </div>

          {isCompleted ? (
            <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              Completed
            </span>
          ) : (
            <form action={markLessonCompleted}>
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="courseSlug" value={course.slug} />
              <input type="hidden" name="lessonSlug" value={lesson.slug} />

              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Mark as Completed
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Video */}
      {lesson.bunnyVideoId ? (
        <SecureBunnyPlayer lessonId={lesson.id} />
      ) : lesson.videoUrl ? (
        <video
          src={lesson.videoUrl}
          controls
          controlsList="nodownload"
          className="w-full rounded-lg shadow-sm"
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-gray-500">No video available for this lesson.</p>
        </div>
      )}

      {/* Lesson navigation */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          {prevLesson && (
            <Link
              href={`/dashboard/courses/${course.slug}/lessons/${prevLesson.slug}`}
              className="text-blue-600 hover:underline"
            >
              ← Previous Lesson
            </Link>
          )}
        </div>

        <div>
          {nextLesson && (
            <Link
              href={`/dashboard/courses/${course.slug}/lessons/${nextLesson.slug}`}
              className="text-blue-600 hover:underline"
            >
              Next Lesson →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
