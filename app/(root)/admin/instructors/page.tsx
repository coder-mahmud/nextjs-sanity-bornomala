// app/admin/instructors/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import InstructorTable from "./_components/InstructorTable";

export default async function InstructorsPage() {
  const rawInstructors = await prisma.instructor.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      title: true,
      designation: true,
      studentCount: true,
      courseCount: true,
      rating: true,
      imageUrl: true,
    },
  });

  // Serialize Prisma Decimal fields to plain numbers so they can be passed to Client Components
  const instructors = rawInstructors.map((instructor) => ({
    ...instructor,
    rating: instructor.rating ? Number(instructor.rating) : null,
  }));

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all platform instructors and profiles.</p>
        </div>
        <Link
          href="/admin/instructors/create"
          className="flex items-center gap-2 rounded-xl bg-[#118F6B] px-4 py-2.5 font-semibold text-white hover:bg-[#355048]"
        >
          <Plus className="h-5 w-5" />
          Add Instructor
        </Link>
      </div>

      <InstructorTable initialInstructors={instructors} />
    </section>
  );
}