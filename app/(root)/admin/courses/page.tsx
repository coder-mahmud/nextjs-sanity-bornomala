import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, BookOpen, Layers, Users, Eye, Pencil, Trash2 } from "lucide-react";
import CourseRowDelete from "./CourseRowDelete";

const CoursesPage = async () => {
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const [batches, accesses] = await Promise.all([
    prisma.batch.findMany({ select: { courseId: true } }),
    prisma.courseAccess.findMany({ select: { courseId: true } }),
  ]);

  const tally = (rows: { courseId: string | null }[]) => {
    const map = new Map<string, number>();
    for (const row of rows) {
      if (row.courseId) {
        map.set(row.courseId, (map.get(row.courseId) ?? 0) + 1);
      }
    }
    return map;
  };

  const batchMap = tally(batches);
  const accessMap = tally(accesses);

  return (
    <section className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Course Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your courses, active batches, and student enrollments.
          </p>
        </div>

        <Link
          href="/admin/courses/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </Link>
      </div>

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">
            No courses found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first course to the platform.
          </p>

          <Link
            href="/admin/courses/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create First Course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50/80">
                <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Batches</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50/50 transition"
                  >
                    {/* Course Info */}
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          <Link href={`/admin/courses/${course.id}`}>
                            {course.title}
                          </Link>
                        </h3>
                        {course.level && (
                          <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {course.level}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {course.price.toString()} {course.currency || "EUR"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          course.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                            : course.status === "ARCHIVED"
                              ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                              : "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/10"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>

                    {/* Batches Count */}
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span>{batchMap.get(course.id) ?? 0}</span>
                      </div>
                    </td>

                    {/* Students Count */}
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{accessMap.get(course.id) ?? 0}</span>
                      </div>
                    </td>

                    {/* Direct Action Icons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Show Details (Eye) */}
                        <Link
                          href={`/admin/courses/${course.id}`}
                          title="Show Details"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Edit Details (Pencil) */}
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          title="Edit Course"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>

                        {/* Delete Action */}
                        {/* Note: If you want the confirmation modal behavior, you can extract a small client component for the delete button */}
                        <CourseRowDelete courseId={course.id} />
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