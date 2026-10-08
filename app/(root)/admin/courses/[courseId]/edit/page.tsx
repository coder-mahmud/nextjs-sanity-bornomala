import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EditCourseForm from "./EditCourseForm";
import { ArrowLeft } from "lucide-react";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    notFound();
  }

  // Convert Prisma Decimal and special types to plain JSON before passing to Client Component
  const serializedCourse = JSON.parse(JSON.stringify(course));

  return (
    <section className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Link
          href={`/admin/courses/${course.id}`}
          className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Course Details</h1>
          <p className="text-xs text-gray-500">Update general information, pricing, status, and imagery.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <EditCourseForm course={serializedCourse} />
      </div>
    </section>
  );
}