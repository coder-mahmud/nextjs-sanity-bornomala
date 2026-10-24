// app/dashboard/courses/[slug]/lessons/[lessonSlug]/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, CalendarClock, Paperclip, Download, HelpCircle, CheckCircle } from "lucide-react";
import StudentHomeworkForm from "./_components/StudentHomeworkForm";

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
    where: { email: session.user.email },
    select: { id: true },
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
      isCompleted: true,
      completedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  redirect(`/dashboard/courses/${courseSlug}/lessons/${lessonSlug}`);
}

// Server action for handling student homework submissions
async function handleHomeworkSubmission(formData: FormData) {
  "use server";

  const lessonId = formData.get("lessonId") as string;
  const courseSlug = formData.get("courseSlug") as string;
  const lessonSlug = formData.get("lessonSlug") as string;
  const fileUrl = formData.get("fileUrl") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const comment = formData.get("comment") as string;

  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  try {
    await prisma.lessonSubmission.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        fileUrl: fileUrl || null,
        videoUrl: videoUrl || null,
        comment: comment || null,
      },
      create: {
        userId: user.id,
        lessonId,
        fileUrl: fileUrl || null,
        videoUrl: videoUrl || null,
        comment: comment || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Homework submission error:", error);
    return { success: false, error: "Database error during submission" };
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/login");
  }

  /*
   * 1. Lesson with relation to quiz and submissions
   */
  const lesson = await prisma.lesson.findUnique({
    where: { slug: lessonSlug },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          passingScore: true,
          slug: true,
        },
      },
      submissions: {
        where: { userId: user.id },
      },
    },
  });

  if (!lesson || !lesson.batchId) {
    redirect("/dashboard/courses");
  }

  const existingSubmission = lesson.submissions[0] || null;

  /*
   * 2. Batch details
   */
  const batch = await prisma.batch.findUnique({
    where: { id: lesson.batchId },
  });

  if (!batch) {
    redirect("/dashboard/courses");
  }

  /*
   * 3. Course details
   */
  const course = await prisma.course.findUnique({
    where: { id: batch.courseId },
  });

  if (!course) {
    redirect("/dashboard/courses");
  }

  /*
   * 4. All lessons in this batch for pagination
   */
  const batchLessons = await prisma.lesson.findMany({
    where: { batchId: batch.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
    },
  });

  if (course.slug !== slug) {
    redirect(`/dashboard/courses/${course.slug}/lessons/${lesson.slug}`);
  }

  /*
   * Check access
   */
  const access = await prisma.courseAccess.findFirst({
    where: {
      userId: user.id,
      courseId: course.id,
    },
  });

  const hasAccess = !!access || lesson.isPreview;

  if (!hasAccess) {
    return (
      <section className="py-8 max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-red-600 font-medium">
            You do not have access to this lesson. Please purchase the course to unlock its contents.
          </p>

          <Link
            href={`/dashboard/courses/${course.slug}`}
            className="mt-4 inline-block rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
          >
            Back to Course Overview
          </Link>
        </div>
      </section>
    );
  }

  /*
   * Track progress record upsert
   */
  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lesson.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      lessonId: lesson.id,
    },
  });

  const isCompleted = progress.isCompleted === true;

  const lessonIndex = batchLessons.findIndex((item) => item.id === lesson.id);
  const prevLesson = lessonIndex > 0 ? batchLessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex >= 0 && lessonIndex < batchLessons.length - 1
      ? batchLessons[lessonIndex + 1]
      : null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  return (
    <section className="py-8 max-w-4xl mx-auto px-4 space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href={`/dashboard/courses/${course.slug}`}
          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 mb-3"
        >
          ← Back to {course.title}
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-mono font-semibold text-gray-600">
                Lesson #{lesson.order}
              </span>
              {lesson.isPreview && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                  Free Preview
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>

            {lesson.description && (
              <p className="text-xs text-gray-600 leading-relaxed">{lesson.description}</p>
            )}
          </div>

          <div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-xs font-semibold text-green-700">
                <CheckCircle className="w-4 h-4" /> Completed
              </span>
            ) : (
              <form action={markLessonCompleted}>
                <input type="hidden" name="lessonId" value={lesson.id} />
                <input type="hidden" name="courseSlug" value={course.slug} />
                <input type="hidden" name="lessonSlug" value={lesson.slug} />

                <button
                  type="submit"
                  className="rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition shadow-sm cursor-pointer"
                >
                  Mark as Completed
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Time Window (If Scheduled) */}
      {(lesson.startsAt || lesson.endsAt) && (
        <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-purple-800 text-xs font-bold">
            <CalendarClock className="w-4 h-4 text-purple-600" />
            Quiz time Window
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-purple-950 font-medium">
            <div>
              <span className="text-purple-600 block text-[11px]">Starts At:</span>
              {lesson.startsAt
                ? new Date(lesson.startsAt).toLocaleString("en-US", { timeZone: "UTC" })
                : "Immediate"}
            </div>
            <div>
              <span className="text-purple-600 block text-[11px]">Ends At:</span>
              {lesson.endsAt
                ? new Date(lesson.endsAt).toLocaleString("en-US", { timeZone: "UTC" })
                : "No Limit"}
            </div>
          </div>
        </div>
      )}
      
      {/* Linked Quiz Details */}
      {lesson.quiz && (
        <div className="rounded-2xl border border-indigo-100 bg-white p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Associated Quiz
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100">
            <div>
              <p className="text-xs font-bold text-gray-900">{lesson.quiz.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Duration: {lesson.quiz.durationMinutes} mins • Passing Score: {lesson.quiz.passingScore}%
              </p>
            </div>

            <Link
              href={`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${lesson.quiz.slug}/`}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shrink-0"
            >
              See Quiz Details →
            </Link>
          </div>
        </div>
      )}

      {/* Lecture Notes */}
      {lesson.notes && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
            <FileText className="w-4 h-4 text-blue-600" />
            Lecture Notes & Content
          </div>
          <div className="prose prose-sm text-gray-700 text-xs leading-relaxed max-w-none whitespace-pre-wrap">
            {lesson.notes}
          </div>
        </div>
      )}

      {/* Attachments & Resources */}
      {lesson.attachments && Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
            <Paperclip className="w-4 h-4 text-blue-600" />
            Attachments & Downloads ({lesson.attachments.length})
          </div>
          <div className="space-y-2">
            {lesson.attachments.map((item: any, index: number) => {
              // Extract name and URL safely depending on stored JSON structure
              const fileUrl = typeof item === 'string' ? item : item?.url || "";
              const fileName = typeof item === 'object' && item?.name
                ? item.name
                : fileUrl.split('/').pop() || `Attachment ${index + 1}`;

              const downloadUrl = fileUrl.includes("/upload/")
                ? fileUrl.replace("/upload/", "/upload/fl_attachment/")
                : fileUrl;

              return (
                <a
                  key={index}
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 text-xs transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 max-w-[80%]">
                    <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-800 truncate">{fileName}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 shrink-0">
                    <Download className="w-3.5 h-3.5" /> Download
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Homework Form Component Integration */}
      <StudentHomeworkForm
        lessonId={lesson.id}
        courseSlug={course.slug}
        lessonSlug={lesson.slug}
        cloudName={cloudName}
        uploadPreset={uploadPreset}
        initialSubmission={existingSubmission}
        submitAction={handleHomeworkSubmission}
      />

      {/* Bottom Navigation */}
      <div className="pt-4 flex items-center justify-between border-t border-gray-200">
        <div>
          {prevLesson ? (
            <Link
              href={`/dashboard/courses/${course.slug}/lessons/${prevLesson.slug}`}
              className="text-xs font-semibold text-gray-700 hover:text-black transition inline-flex items-center gap-1"
            >
              ← Previous Lesson
            </Link>
          ) : <span />}
        </div>

        <div>
          {nextLesson && (
            <Link
              href={`/dashboard/courses/${course.slug}/lessons/${nextLesson.slug}`}
              className="text-xs font-semibold text-gray-700 hover:text-black transition inline-flex items-center gap-1"
            >
              Next Lesson →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}