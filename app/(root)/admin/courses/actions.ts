"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CourseStatus } from "@/prisma/generated/prisma/enums";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getBunnyLibraryId(formData: FormData) {
  const libraryId = getString(formData, "bunnyLibraryId");

  return libraryId || process.env.BUNNY_STREAM_LIBRARY_ID || "";
}

async function requireAdmin() {
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPERADMIN")
  ) {
    throw new Error("Unauthorized");
  }

  return session;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getNullableNumber(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!value || typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

async function createUniqueLessonSlug(title: string) {
  const baseSlug = slugify(title) || "lesson";

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.lesson.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createCourse(formData: FormData) {
  await requireAdmin();

  const title = getString(formData, "title");
  const shortDescription = getString(formData, "shortDescription");
  const description = getString(formData, "description");
  const thumbnail = getString(formData, "thumbnail");
  const price = Number(formData.get("price") || 0);
  const currency = getString(formData, "currency") || "USD";
  const level = getString(formData, "level");
  const durationMinutes = getNullableNumber(formData, "durationMinutes");
  const instructorName = getString(formData, "instructorName");
  const status =
    ((formData.get("status") as string) || "DRAFT") as CourseStatus;

  if (!title) {
    throw new Error("Title is required");
  }

  const baseSlug = slugify(title) || "course";
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  await prisma.course.create({
    data: {
      title,
      slug,
      shortDescription: shortDescription || null,
      description: description || null,
      thumbnail: thumbnail || null,
      price,
      currency,
      level: level || null,
      durationMinutes,
      instructorName: instructorName || null,
      status,
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();

  const title = getString(formData, "title");
  const shortDescription = getString(formData, "shortDescription");
  const description = getString(formData, "description");
  const thumbnail = getString(formData, "thumbnail");
  const price = Number(formData.get("price") || 0);
  const currency = getString(formData, "currency") || "USD";
  const level = getString(formData, "level");
  const durationMinutes = getNullableNumber(formData, "durationMinutes");
  const instructorName = getString(formData, "instructorName");
  const status =
    ((formData.get("status") as string) || "DRAFT") as CourseStatus;

  if (!title) {
    throw new Error("Title is required");
  }

  await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      title,
      shortDescription: shortDescription || null,
      description: description || null,
      thumbnail: thumbnail || null,
      price,
      currency,
      level: level || null,
      durationMinutes,
      instructorName: instructorName || null,
      status,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath(`/admin/courses/${courseId}/sections`);

  redirect("/admin/courses");
}

// export async function createCourseSection(
//   courseId: string,
//   formData: FormData,
// ) {
//   await requireAdmin();

//   const title = getString(formData, "title");
//   const description = getNullableString(formData, "description");

//   if (!title) {
//     throw new Error("Section title is required");
//   }

//   const maxOrder = await prisma.courseSection.aggregate({
//     where: {
//       courseId,
//     },
//     _max: {
//       order: true,
//     },
//   });

//   const nextOrder = (maxOrder._max.order ?? 0) + 1;

//   await prisma.courseSection.create({
//     data: {
//       courseId,
//       title,
//       description,
//       order: nextOrder,
//     },
//   });

//   revalidatePath("/admin/courses");
//   revalidatePath(`/admin/courses/${courseId}/sections`);
// }

export async function createCourseSection(
  courseId: string,
  _previousState: {
    status: "success" | "error";
    message: string;
  } | null,
  formData: FormData,
) {
  try {
    await requireAdmin();

    const title = getString(formData, "title");
    const description = getNullableString(formData, "description");

    if (!title) {
      return {
        status: "error" as const,
        message: "Section title is required",
      };
    }

    const maxOrder = await prisma.courseSection.aggregate({
      where: {
        courseId,
      },
      _max: {
        order: true,
      },
    });

    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    await prisma.courseSection.create({
      data: {
        course: {
          connect: {
            id: courseId,
          },
        },
        title,
        description,
        order: nextOrder,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/sections`);

    return {
      status: "success" as const,
      message: "Course section added",
    };
  } catch (error) {
    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to add course section",
    };
  }
}



export async function updateCourseSection(
  courseId: string,
  sectionId: string,
  _previousState: {
    status: "success" | "error";
    message: string;
  } | null,
  formData: FormData,
) {
  try {
    await requireAdmin();

    const title = getString(formData, "title");
    const description = getNullableString(formData, "description");

    if (!title) {
      return {
        status: "error" as const,
        message: "Section title is required",
      };
    }

    const section = await prisma.courseSection.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section || section.courseId !== courseId) {
      return {
        status: "error" as const,
        message: "Section not found",
      };
    }

    await prisma.courseSection.update({
      where: {
        id: sectionId,
      },
      data: {
        title,
        description,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/sections`);

    return {
      status: "success" as const,
      message: "Course section updated",
    };
  } catch (error) {
    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update course section",
    };
  }
}

export async function deleteCourseSection(
  courseId: string,
  sectionId: string,
) {
  await requireAdmin();

  const section = await prisma.courseSection.findUnique({
    where: {
      id: sectionId,
    },
  });

  if (!section || section.courseId !== courseId) {
    throw new Error("Section not found");
  }

  await prisma.courseSection.delete({
    where: {
      id: sectionId,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/sections`);
}



export async function createLesson(
  courseId: string,
  sectionId: string,
  _previousState: {
    status: "success" | "error";
    message: string;
  } | null,
  formData: FormData,
) {
  try {
    await requireAdmin();

    const title = getString(formData, "title");
    const description = getNullableString(formData, "description");
    const bunnyLibraryId = getBunnyLibraryId(formData);
    const bunnyVideoId = getString(formData, "bunnyVideoId");
    const durationSeconds = getNullableNumber(formData, "durationSeconds");
    const isPreview = formData.get("isPreview") === "on";

    if (!title) {
      return {
        status: "error" as const,
        message: "Lesson title is required",
      };
    }

    if (!bunnyLibraryId) {
      return {
        status: "error" as const,
        message: "Bunny library ID is required",
      };
    }

    if (!bunnyVideoId) {
      return {
        status: "error" as const,
        message: "Bunny video ID is required",
      };
    }

    const section = await prisma.courseSection.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section || section.courseId !== courseId) {
      return {
        status: "error" as const,
        message: "Section not found",
      };
    }

    const maxOrder = await prisma.lesson.aggregate({
      where: {
        sectionId,
      },
      _max: {
        order: true,
      },
    });

    const nextOrder = (maxOrder._max.order ?? 0) + 1;
    const slug = await createUniqueLessonSlug(title);

    await prisma.lesson.create({
      data: {
        section: {
          connect: {
            id: sectionId,
          },
        },
        title,
        slug,
        description,
        videoUrl: null,
        bunnyLibraryId,
        bunnyVideoId,
        durationSeconds,
        order: nextOrder,
        isPreview,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/sections`);

    return {
      status: "success" as const,
      message: "Lesson added",
    };
  } catch (error) {
    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to add lesson",
    };
  }
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  _previousState: {
    status: "success" | "error";
    message: string;
  } | null,
  formData: FormData,
) {
  try {
    await requireAdmin();

    const title = getString(formData, "title");
    const description = getNullableString(formData, "description");
    const bunnyLibraryId = getBunnyLibraryId(formData);
    const bunnyVideoId = getString(formData, "bunnyVideoId");
    const durationSeconds = getNullableNumber(formData, "durationSeconds");
    const isPreview = formData.get("isPreview") === "on";

    if (!title) {
      return {
        status: "error" as const,
        message: "Lesson title is required",
      };
    }

    if (!bunnyLibraryId) {
      return {
        status: "error" as const,
        message: "Bunny library ID is required",
      };
    }

    if (!bunnyVideoId) {
      return {
        status: "error" as const,
        message: "Bunny video ID is required",
      };
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        section: true,
      },
    });

    if (!lesson || lesson.section.courseId !== courseId) {
      return {
        status: "error" as const,
        message: "Lesson not found",
      };
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title,
        description,
        videoUrl: null,
        bunnyLibraryId,
        bunnyVideoId,
        durationSeconds,
        isPreview,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/sections`);

    return {
      status: "success" as const,
      message: "Lesson updated",
    };
  } catch (error) {
    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update lesson",
    };
  }
}


export async function deleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      section: true,
    },
  });

  if (!lesson || lesson.section.courseId !== courseId) {
    throw new Error("Lesson not found");
  }

  await prisma.lesson.delete({
    where: {
      id: lessonId,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/sections`);
}