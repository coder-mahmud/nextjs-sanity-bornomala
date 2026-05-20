import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  createCourseSection,
  updateCourseSection,
  deleteCourseSection,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../actions";
import CreateCourseSectionForm from "@/components/admin/CreateCourseSectionForm";
import EditCourseSectionForm from "@/components/admin/EditCourseSectionForm";
import CreateLessonForm from "@/components/admin/CreateLessonForm";
import EditLessonForm from "@/components/admin/EditLessonForm";

type ManageCourseContentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDuration(seconds: number | null) {
  if (!seconds) {
    return "No duration";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

const ManageCourseContentPage = async ({
  params,
}: ManageCourseContentPageProps) => {
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
    redirect("/admin/courses");
  }

  const createSectionWithCourseId = createCourseSection.bind(
    null,
    course.id,
  );

  const totalLessons = course.sections.reduce(
    (total, section) => total + section.lessons.length,
    0,
  );

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Course Content
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add sections and video lessons for{" "}
            <span className="font-semibold text-gray-700">
              {course.title}
            </span>
            .
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {course.sections.length} Sections
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {totalLessons} Lessons
            </span>
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
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/courses/${course.id}/edit`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Edit Course
          </Link>

          <Link
            href="/admin/courses"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Add New Section
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Sections help group lessons into modules or chapters.
          </p>

          {/* <form action={createSectionWithCourseId} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Section Title *
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Introduction"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Section Description
              </label>
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Short explanation of this section."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Add Section
            </button>
          </form> */}

          <CreateCourseSectionForm action={createSectionWithCourseId} />




        </aside>

        <div className="space-y-6">
          {course.sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                No sections yet
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Create your first section, then add video lessons inside it.
              </p>
            </div>
          ) : (
            course.sections.map((section) => {
              const updateSectionWithIds = updateCourseSection.bind(
                null,
                course.id,
                section.id,
              );

              const deleteSectionWithIds = deleteCourseSection.bind(
                null,
                course.id,
                section.id,
              );

              const createLessonWithIds = createLesson.bind(
                null,
                course.id,
                section.id,
              );

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="border-b border-gray-100 bg-gray-50 p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Section {section.order}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                          {section.title}
                        </h2>
                        {section.description && (
                          <p className="mt-2 text-sm text-gray-500">
                            {section.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          {section.lessons.length} lesson
                          {section.lessons.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <form action={deleteSectionWithIds}>
                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete Section
                        </button>
                      </form>


                      
                    </div>
                  </div>

                  <div className="space-y-8 p-6">
                    <div className="rounded-2xl border border-gray-200 p-5">
                      <h3 className="text-base font-semibold text-gray-900">
                        Edit Section
                      </h3>

                      {/* <form
                        action={updateSectionWithIds}
                        className="mt-5 space-y-5"
                      >
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Section Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            required
                            defaultValue={section.title}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Section Description
                          </label>
                          <textarea
                            name="description"
                            rows={3}
                            defaultValue={section.description || ""}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                          Save Section
                        </button>
                      </form> */}

                      <EditCourseSectionForm
                        action={updateSectionWithIds}
                        title={section.title}
                        description={section.description || ""}
                      />



                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <h3 className="text-base font-semibold text-gray-900">
                        Add Lesson
                      </h3>
                      <CreateLessonForm  action={createLessonWithIds} defaultLibraryId={process.env.BUNNY_STREAM_LIBRARY_ID || ""}
/>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Lessons
                      </h3>

                      {section.lessons.length === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                          <p className="text-sm text-gray-500">
                            No lessons in this section yet.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {section.lessons.map((lesson) => {
                            const updateLessonWithIds = updateLesson.bind(
                              null,
                              course.id,
                              lesson.id,
                            );

                            const deleteLessonWithIds = deleteLesson.bind(
                              null,
                              course.id,
                              lesson.id,
                            );

                            return (
                              <details
                                key={lesson.id}
                                className="rounded-xl border border-gray-200 bg-white"
                              >
                                <summary className="cursor-pointer list-none p-5">
                                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                          Lesson {lesson.order}
                                        </span>

                                        {lesson.isPreview && (
                                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                            Preview
                                          </span>
                                        )}
                                      </div>

                                      <h4 className="mt-2 font-semibold text-gray-900">
                                        {lesson.title}
                                      </h4>

                                      <p className="mt-1 text-xs text-gray-500">
                                        {formatDuration(
                                          lesson.durationSeconds,
                                        )}
                                      </p>
                                    </div>

                                    <span className="text-sm font-medium text-blue-600">
                                      Edit
                                    </span>
                                  </div>
                                </summary>

                                <div className="border-t border-gray-100 p-5">
                                  <EditLessonForm
                                    action={updateLessonWithIds}
                                    title={lesson.title}
                                    description={lesson.description || ""}
                                    durationSeconds={lesson.durationSeconds}
                                    bunnyLibraryId={
                                      lesson.bunnyLibraryId ||
                                      process.env.BUNNY_STREAM_LIBRARY_ID ||
                                      ""
                                    }
                                    bunnyVideoId={lesson.bunnyVideoId || ""}
                                    isPreview={lesson.isPreview}
                                  />                                  

                                  <form
                                    action={deleteLessonWithIds}
                                    className="mt-4"
                                  >
                                    <button
                                      type="submit"
                                      className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    >
                                      Delete Lesson
                                    </button>
                                  </form>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default ManageCourseContentPage;