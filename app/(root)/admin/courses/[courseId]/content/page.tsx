import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, BookOpen } from "lucide-react";
import CreateLessonModalButton from "./_components/CreateLessonModalButton";
import LessonList from "./_components/LessonList";

interface CourseContentPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseContentPage({ params }: CourseContentPageProps) {
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const { courseId } = await params;


  const [course, quizzes, lessons] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        batches: {
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, status: true },
        },
      },
    }),
    prisma.quiz.findMany({
      select: { id: true, title: true, lessonId: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lesson.findMany({
      where: {
        OR: [
          { batch: { courseId: courseId } },
          { batchId: null }, // Include unassigned lessons if applicable
        ],
      },
      include: {
        batch: { select: { id: true, title: true } },
        quiz: { select: { id: true, title: true } },
      },
      orderBy: { order: "asc" },
    }),
  ]);
  if (!course) {
    notFound();
  }

  return (
    <section className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Details
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-xs text-gray-500">Manage lessons, batches, and linked quizzes</p>
          </div>
        </div>

        <CreateLessonModalButton
          courseId={course.id}
          batches={course.batches}
          quizzes={quizzes}
        />
      </div>

      {/* Lesson List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Course Lessons</h2>
        <LessonList
          lessons={lessons}
          batches={course.batches}
          courseId={course.id}
        />
      </div>
    </section>
  );
}