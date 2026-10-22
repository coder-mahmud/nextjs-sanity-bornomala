// app/admin/courses/[courseId]/content/page.tsx
import { prisma } from "@/lib/prisma";
import CreateBatchModalButton from "./batches/_components/CreateBatchModalButton";
import BatchCardList from "./batches/BatchCardList";
import { notFound } from "next/navigation";

export default async function CourseContentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  // 1. Fetch course details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true },
  });

  if (!course) {
    notFound();
  }

  // 2. Fetch batches
  const batchesData = await prisma.batch.findMany({
    where: { courseId },
    include: {
      instructor: {
        select: { id: true, name: true, title: true },
      },
      _count: {
        select: {
          lessons: true,
          accesses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Format dates to avoid client/server timezone hydration mismatches
  const formattedBatches = batchesData.map((batch) => ({
    ...batch,
    startDate: batch.startDate ? new Date(batch.startDate).toISOString().split("T")[0] : null,
    endDate: batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : null,
    createdAt: batch.createdAt ? new Date(batch.createdAt).toISOString() : null,
    updatedAt: batch.updatedAt ? new Date(batch.updatedAt).toISOString() : null,
  }));

  const batches = JSON.parse(JSON.stringify(formattedBatches));

  // 3. Fetch all instructors for the dropdown selection safely
  const instructors = (await prisma.instructor.findMany({
    select: {
      id: true,
      name: true,
      title: true,
    },
    orderBy: {
      name: "asc",
    },
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-xs text-gray-500">Manage course batches and live schedules</p>
        </div>
        <CreateBatchModalButton courseId={course.id} instructors={instructors} />
      </div>

      <BatchCardList batches={batches} />
    </div>
  );
}