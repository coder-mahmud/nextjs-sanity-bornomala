import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const CoursesPage = async () => {
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          sections: true,
          accesses: true,
          payments: true,
        },
      },
    },
  });

  return (
    <section>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Video Courses
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all courses, sections, lessons, and enrollments.
          </p>
        </div>

        <Link
          href="/admin/courses/create"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Create Course
        </Link>
      </div>

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No courses found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your first video course to get started.
          </p>

          <Link
            href="/admin/courses/create"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Create First Course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm font-semibold text-gray-600">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Sections</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Payments</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course.id} className="text-sm text-gray-700">
                    {/* Course Info */}
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {course.title}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          /{course.slug}
                        </p>

                        {course.level && (
                          <p className="mt-1 text-xs text-gray-500">
                            {course.level}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      {course.price.toString()} {course.currency}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          course.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : course.status === "ARCHIVED"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>

                    {/* Sections */}
                    <td className="px-6 py-4">
                      {course._count.sections}
                    </td>

                    {/* Students */}
                    <td className="px-6 py-4">
                      {course._count.accesses}
                    </td>

                    {/* Payments */}
                    <td className="px-6 py-4">
                      {course._count.payments}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </Link>

                        <Link
                          href={`/admin/courses/${course.id}/sections`}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Manage Content
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default CoursesPage;