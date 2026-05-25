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

  return (
    <section className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>

        {course.description && (
          <p className="mt-2 text-gray-500">{course.description}</p>
        )}

        {hasAccess && (
          <p className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            You have access to this course
          </p>
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

                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {lesson.title}
                          </p>

                          {lesson.isPreview && (
                            <p className="mt-1 text-xs text-blue-600">
                              Preview lesson
                            </p>
                          )}
                        </div>

                        {canViewLesson ? (
                          <Link
                            href={`/dashboard/courses/${course.slug}/lessons/${lesson.slug}`}
                            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                          >
                            Watch
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