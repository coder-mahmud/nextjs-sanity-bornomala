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

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
      lastWatchedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      watchedSeconds: 0,
      completed: true,
      completedAt: new Date(),
      lastWatchedAt: new Date(),
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
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      slug: lessonSlug,
    },
    include: {
      progressRecords: {
        where: {
          userId: user.id,
        },
      },
      section: {
        include: {
          course: true,
          lessons: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    redirect("/dashboard/courses");
  }

  const course = lesson.section.course;

  if (course.slug !== slug) {
    redirect(`/dashboard/courses/${course.slug}/lessons/${lesson.slug}`);
  }

  const access = await prisma.courseAccess.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  const hasAccess = !!access || lesson.isPreview;

  if (!hasAccess) {
    return (
      <section className="py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-red-600">
            You do not have access to this lesson. Please purchase the course.
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

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lesson.id,
      },
    },
    update: {
      lastWatchedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId: lesson.id,
      watchedSeconds: 0,
      lastWatchedAt: new Date(),
    },
  });

  const progress = lesson.progressRecords[0];
  const isCompleted = progress?.completed === true;

  const lessonIndex = lesson.section.lessons.findIndex(
    (item) => item.id === lesson.id
  );

  const prevLesson = lesson.section.lessons[lessonIndex - 1];
  const nextLesson = lesson.section.lessons[lessonIndex + 1];

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