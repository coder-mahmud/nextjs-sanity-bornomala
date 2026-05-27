// app/dashboard/courses/[slug]/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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
  });

  if (!user) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: {
      slug,
    },
    include: {
      sections: {
        orderBy: {
          order: "asc",
        },
        include: {
          lessons: {
            orderBy: {
              order: "asc",
            },
            include: {
              progressRecords: {
                where: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return (
      <section className="py-8">
        <p className="text-red-500">Course not found.</p>
      </section>
    );
  }

  const access = await prisma.courseAccess.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  const hasAccess = !!access;

  const allLessons = course.sections.flatMap((section) => section.lessons);
  const totalLessons = allLessons.length;

  const completedLessons = allLessons.filter((lesson) =>
    lesson.progressRecords.some((progress) => progress.completed)
  ).length;

  const progressPercentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

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
                You have access to this course
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


        {hasAccess && progressPercentage === 100 && (
          <Link
            href={`/api/certificates/course/${course.id}`}
            className="mt-4 inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Download Certificate
          </Link>
        )}


      </div>

      {course.sections.length === 0 ? (
        <p className="text-gray-500">No sections or lessons available.</p>
      ) : (
        <div className="space-y-6">
          {course.sections.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>

              {section.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {section.description}
                </p>
              )}

              {section.lessons.length === 0 ? (
                <p className="mt-4 text-gray-500">
                  No lessons in this section.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {section.lessons.map((lesson) => {
                    const canViewLesson = hasAccess || lesson.isPreview;
                    const isCompleted = lesson.progressRecords.some(
                      (progress) => progress.completed
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

                            {lesson.isPreview && (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                Preview
                              </span>
                            )}
                          </div>
                        </div>

                        {canViewLesson ? (
                          <Link
                            href={`/dashboard/courses/${course.slug}/lessons/${lesson.slug}`}
                            className={`rounded-lg px-4 py-2 text-sm text-white ${
                              isCompleted
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-black hover:bg-gray-800"
                            }`}
                          >
                            {isCompleted ? "Review" : "Watch"}
                          </Link>
                        ) : (
                          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-400">
                            Locked
                          </span>
                        )}
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