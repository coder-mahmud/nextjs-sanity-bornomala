// app/admin/instructors/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InstructorForm from "../../_components/InstructorForm";

interface EditInstructorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInstructorPage({ params }: EditInstructorPageProps) {
  const { id } = await params;

  const instructor = await prisma.instructor.findUnique({
    where: { id },
  });

  if (!instructor) {
    notFound();
  }

  // Serialize Prisma Decimal and ensure imagePublicId is passed
  const formattedInstructor = {
    ...instructor,
    rating: instructor.rating ? Number(instructor.rating) : null,
  };

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  return (
    <section className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Instructor</h1>
        <p className="mt-1 text-sm text-gray-500">Update details for {instructor.name}.</p>
      </div>
      <InstructorForm
        initialData={formattedInstructor}
        cloudName={cloudName}
        uploadPreset={uploadPreset}
      />
    </section>
  );
}