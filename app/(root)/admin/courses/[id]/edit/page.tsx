import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateCourse } from "../../actions";

type EditCoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditCoursePage = async ({ params }: EditCoursePageProps) => {
  const { id } = await params;

  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
  });

  if (!course) {
    redirect("/admin/courses");
  }

  const updateCourseWithId = updateCourse.bind(null, course.id);

  return (
    <section className="max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Course
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update course information, price, status, and metadata.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/courses/${course.id}/sections`}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Manage Content
          </Link>

          <Link
            href="/admin/courses"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back
          </Link>
        </div>
      </div>

      <form
        action={updateCourseWithId}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={course.title}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Complete JavaScript Course"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            value={course.slug}
            disabled
            className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Slug is generated when the course is created.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Short Description
          </label>
          <textarea
            name="shortDescription"
            rows={2}
            defaultValue={course.shortDescription || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="A concise summary of the course."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full Description
          </label>
          <textarea
            name="description"
            rows={6}
            defaultValue={course.description || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Detailed course description."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Thumbnail URL
          </label>
          <input
            type="text"
            name="thumbnail"
            defaultValue={course.thumbnail || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="https://example.com/course-thumbnail.jpg"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              required
              defaultValue={course.price.toString()}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Currency
            </label>
            <input
              type="text"
              name="currency"
              defaultValue={course.currency}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Level
            </label>
            <select
              name="level"
              defaultValue={course.level || ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Duration Minutes
            </label>
            <input
              type="number"
              name="durationMinutes"
              defaultValue={course.durationMinutes ?? ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="600"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Instructor Name
          </label>
          <input
            type="text"
            name="instructorName"
            defaultValue={course.instructorName || ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Mahmud Hasan"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            defaultValue={course.status}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Update Course
          </button>

          <Link
            href="/admin/courses"
            className="rounded-xl border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
};

export default EditCoursePage;