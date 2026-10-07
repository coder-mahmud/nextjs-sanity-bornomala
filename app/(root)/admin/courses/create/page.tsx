import { prisma } from "@/lib/prisma";
import CreateCourseForm from "./CreateCourseForm";

const CreateCoursePage = async () => {
  const instructors = await prisma.instructor.findMany({
    select: {
      id: true,
      name: true,
      title: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  return (
    <section className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Course</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new video course to your platform.
        </p>
      </div>

      <CreateCourseForm
        instructors={instructors}
        cloudName={cloudName}
        uploadPreset={uploadPreset}
      />
    </section>
  );
};

export default CreateCoursePage;