import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Video } from "lucide-react";
import EditLessonForm from "./_components/EditLessonForm";

interface EditLessonPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
    batchId:string;
  }>;
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const { courseId, lessonId, batchId } = await params;

  const [lesson, course, quizzes] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: true,
      },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        batches: {
          select: { id: true, title: true },
        },
      },
    }),
    prisma.quiz.findMany({
      select: { id: true, title: true,},
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!lesson || !course) {
    notFound();
  }

  return (
    <section className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        href={`/admin/courses/${courseId}/content/batches/${[batchId]}/${[lessonId]}`}
        className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Lesson
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6 pb-4 border-b">
          <Video className="w-5 h-5 text-blue-600" />
          Edit Lesson: {lesson.title}
        </h1>

        <EditLessonForm
          lesson={JSON.parse(JSON.stringify(lesson))}
          courseId={courseId}
          batches={course.batches}
          quizzes={quizzes}
          batchId={batchId}
        />
      </div>
    </section>
  );
}