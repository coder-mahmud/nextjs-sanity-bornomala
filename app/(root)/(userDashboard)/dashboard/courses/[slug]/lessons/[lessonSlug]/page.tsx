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

        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {lesson.title}
        </h1>

        {lesson.description && (
          <p className="mt-2 text-gray-500">{lesson.description}</p>
        )}
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