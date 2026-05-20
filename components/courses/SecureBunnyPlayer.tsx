import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBunnyStreamEmbedUrl } from "@/lib/bunny-stream";
import Link from "next/link";

type SecureBunnyPlayerProps = {
  lessonId: string;
};

const SecureBunnyPlayer = async ({ lessonId }: SecureBunnyPlayerProps) => {
  const session = await auth();

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      section: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Lesson not found.
      </div>
    );
  }

  if (!lesson.bunnyVideoId) {
    return (
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-sm text-yellow-700">
        This lesson does not have a Bunny video ID yet.
      </div>
    );
  }

  const course = lesson.section.course;

  let hasAccess = lesson.isPreview;

  if (
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "SUPERADMIN"
  ) {
    hasAccess = true;
  }

  let dbUserId: string | null = null;

  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    dbUserId = dbUser?.id || null;
  }

  if (!hasAccess && dbUserId) {
    const courseAccess = await prisma.courseAccess.findUnique({
      where: {
        userId_courseId: {
          userId: dbUserId,
          courseId: course.id,
        },
      },
    });

    if (courseAccess) {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          This lesson is locked
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Please purchase or enroll in this course to watch the video.
        </p>

        <Link
          href={`/courses/${course.slug}`}
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          View Course
        </Link>
      </div>
    );
  }

  const embedUrl = getBunnyStreamEmbedUrl({
    libraryId: lesson.bunnyLibraryId,
    videoId: lesson.bunnyVideoId,
    expiresInSeconds: 300,
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black pt-[56.25%] shadow-sm">
      <iframe
        src={embedUrl}
        loading="lazy"
        className="absolute left-0 top-0 h-full w-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
};

export default SecureBunnyPlayer;