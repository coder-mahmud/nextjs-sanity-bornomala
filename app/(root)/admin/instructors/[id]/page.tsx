import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface InstructorDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InstructorDetailsPage({ params }: InstructorDetailsPageProps) {
  const { id } = await params;

  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: {
      courses: {
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
        },
      },
    },
  });

  if (!instructor) {
    notFound();
  }

  return (
    <section className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{instructor.name}</h1>
          <p className="text-sm text-gray-500">{instructor.title || "Instructor Profile"}</p>
        </div>
        <Link
          href={`/admin/instructors/${instructor.id}/edit`}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Edit Instructor
        </Link>
      </div>

      {/* Overview Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6">
        {instructor.imageUrl ? (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={instructor.imageUrl}
              alt={instructor.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
            No Image
          </div>
        )}

        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap gap-2">
            {instructor.designation && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                {instructor.designation}
              </span>
            )}
            {instructor.experience && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {instructor.experience}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{instructor.description || "No description provided."}</p>
          
          <div className="flex gap-6 pt-2 text-sm text-gray-500">
            <div><strong className="text-gray-900">{instructor.studentCount}</strong> Students</div>
            <div><strong className="text-gray-900">{instructor.courseCount}</strong> Courses</div>
            <div><strong className="text-gray-900">{instructor.rating ? Number(instructor.rating) : "N/A"}</strong> Rating</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {instructor.tags.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags & Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {instructor.tags.map((tag, i) => (
              <span key={i} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Courses */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Courses</h3>
        {instructor.courses.length === 0 ? (
          <p className="text-sm text-gray-500">No courses assigned to this instructor yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {instructor.courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900">{course.title}</h4>
                  <span className="text-xs text-gray-500">Status: {course.status}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700">€{Number(course.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}