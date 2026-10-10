import { prisma } from "@/lib/prisma";
import InstructorForm from "../_components/InstructorForm";

export default async function CreateInstructorPage() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  return (
    <section className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Instructor</h1>
        <p className="mt-1 text-sm text-gray-500">Add a new instructor profile to the platform.</p>
      </div>
      <InstructorForm cloudName={cloudName} uploadPreset={uploadPreset} />
    </section>
  );
}