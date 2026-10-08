import {prisma} from "@/lib/prisma";
import CreateBatchModalButton from "./batches/_components/CreateBatchModalButton";
import BatchCardList from "./batches/BatchCardList";
import { notFound } from "next/navigation";

export default async function CourseContentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true },
  });

  if (!course) {
    notFound();
  }

  const batches = await prisma.batch.findMany({
    where: { courseId },
    include: {
      _count: {
        select: {
          lessons: true,
          accesses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-xs text-gray-500">Manage course batches and live schedules</p>
        </div>
        <CreateBatchModalButton courseId={course.id} />
      </div>

      <BatchCardList batches={batches} />
    </div>
  );
}