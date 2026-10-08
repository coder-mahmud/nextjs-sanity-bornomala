import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  Plus, 
  BookOpen, 
  Layers, 
  Users, 
  CreditCard, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Calendar 
} from "lucide-react";
import CourseActionsDropdown from "./CourseActionsDropdown";

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
          batches: true,
          accesses: true,
          payments: true,
        },
      },
    },
  });

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
            Manage all your courses, active batches, student enrollments, and lecture contents.
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
                  <th className="px-6 py-4">Payments</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition">
                    {/* Course Info */}
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {course.title}
                        </h3>

                        <p className="mt-0.5 text-xs text-gray-500 font-mono">
                          /{course.slug}
                        </p>

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
                        <span>{course._count.batches}</span>
                      </div>
                    </td>

                    {/* Students Count */}
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{course._count.accesses}</span>
                      </div>
                    </td>

                    {/* Payments */}
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span>{course._count.payments}</span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(course.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-4 text-right">
                      <CourseActionsDropdown courseId={course.id} />
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