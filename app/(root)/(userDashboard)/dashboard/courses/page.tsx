// app/dashboard/courses/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CoursesPage() {
  // Authenticate user
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Fetch user with course accesses
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      courseAccesses: {
        include: {
          course: true,
        },
        orderBy: { grantedAt: "desc" },
      },
    },
  });

  if (!user || user.courseAccesses.length === 0) {
    return (
      <section className="py-8">
        <h1 className="text-2xl font-bold mb-4">My Courses</h1>
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">
            You do not have access to any courses yet.
          </p>
          <Link
            href="/video-courses"
            className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Browse Courses
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {user.courseAccesses.map((access) => {
          const course = access.course;
          return (
            <Link
              key={course.id}
              href={`/dashboard/courses/${course.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {course.title}
              </h2>
              {course.shortDescription && (
                <p className="mt-1 text-sm text-gray-500">
                  {course.shortDescription}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}