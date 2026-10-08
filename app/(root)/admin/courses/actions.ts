"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
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
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
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

function getStringArray(formData: FormData, key: string): string[] {
  const raw = formData.get(key);
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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

/* ==========================================
   COURSE ACTIONS
   ========================================== */

export async function createCourse(formData: FormData) {
  await requireAdmin();

  const title = getString(formData, "title");
  const tagLine = getNullableString(formData, "tagLine");
  const shortDescription = getNullableString(formData, "shortDescription");
  const description = getNullableString(formData, "description");
  const thumbnail = getNullableString(formData, "thumbnail");
  const price = Number(formData.get("price") || 0);
  const currency = getString(formData, "currency") || "EUR";
  const level = getNullableString(formData, "level");
  const duration = getNullableString(formData, "duration");
  const numberOfStudents = getNullableString(formData, "numberOfStudents");
  const rating = getNullableString(formData, "rating");
  const instructorId =
    getNullableString(formData, "instructorId") || undefined;
  const order = getNullableNumber(formData, "order");
  const status =
    ((formData.get("status") as string) || "DRAFT") as CourseStatus;

  const characteristics = getStringArray(formData, "characteristics");
  const targetAudience = getStringArray(formData, "targetAudience");

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

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      tagLine,
      shortDescription,
      description,
      thumbnail,
      price,
      currency,
      level,
      duration,
      numberOfStudents,
      rating,
      instructorId,
      order,
      status,
      characteristics,
      targetAudience,
    },
  });

  revalidatePath("/admin/courses");
  return { success: true, courseId: course.id };
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();

  const title = getString(formData, "title");
  const tagLine = getNullableString(formData, "tagLine");
  const shortDescription = getNullableString(formData, "shortDescription");
  const description = getNullableString(formData, "description");
  const thumbnail = getNullableString(formData, "thumbnail");
  const price = Number(formData.get("price") || 0);
  const currency = getString(formData, "currency") || "EUR";
  const level = getNullableString(formData, "level");
  const duration = getNullableString(formData, "duration");
  const numberOfStudents = getNullableString(formData, "numberOfStudents");
  const rating = getNullableString(formData, "rating");
  const instructorId =
    getNullableString(formData, "instructorId") || undefined;
  const order = getNullableNumber(formData, "order");
  const status =
    ((formData.get("status") as string) || "DRAFT") as CourseStatus;

  const characteristics = getStringArray(formData, "characteristics");
  const targetAudience = getStringArray(formData, "targetAudience");

  if (!title) {
    throw new Error("Title is required");
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title,
      tagLine,
      shortDescription,
      description,
      thumbnail,
      price,
      currency,
      level,
      duration,
      numberOfStudents,
      rating,
      instructorId,
      order,
      status,
      characteristics,
      targetAudience,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/edit`);

  return { success: true };
}

export async function deleteCourse(courseId: string) {
  try {
    await requireAdmin();

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return { success: false, message: "Course not found" };
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete course",
    };
  }
}

/* ==========================================
   LESSON ACTIONS (LINKED TO BATCH)
   ========================================== */

export async function createLesson(
  batchId: string,
  _previousState: {
    status: "success" | "error";
    message: string;
  } | null,
  formData: FormData
) {
  try {
    await requireAdmin();

    const title = getString(formData, "title");
    const description = getNullableString(formData, "description");
    const notes = getNullableString(formData, "notes");
    const bunnyLibraryId = getBunnyLibraryId(formData);
    const bunnyVideoId = getString(formData, "bunnyVideoId");
    const isPreview = formData.get("isPreview") === "on";

    if (!title) {
      return { status: "error" as const, message: "Lesson title is required" };
    }

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return { status: "error" as const, message: "Batch not found" };
    }

    const maxOrder = await prisma.lesson.aggregate({
      where: { batchId },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order ?? 0) + 1;
    const slug = await createUniqueLessonSlug(title);

    await prisma.lesson.create({
      data: {
        batch: { connect: { id: batchId } },
        title,
        slug,
        description,
        notes,
        bunnyLibraryId,
        bunnyVideoId,
        order: nextOrder,
        isPreview,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/batches/${batchId}`);

    return { status: "success" as const, message: "Lesson added successfully" };
  } catch (error) {
    return {
      status: "error" as const,
      message:
        error instanceof Error ? error.message : "Failed to add lesson",
    };
  }
}

export async function updateLesson(
  lessonId: string,
  _previousState: {
    status: "success" | "error";
    message: string;
  } | null,
  formData: FormData
) {
  try {
    await requireAdmin();

    const title = getString(formData, "title");
    const description = getNullableString(formData, "description");
    const notes = getNullableString(formData, "notes");
    const bunnyLibraryId = getBunnyLibraryId(formData);
    const bunnyVideoId = getString(formData, "bunnyVideoId");
    const isPreview = formData.get("isPreview") === "on";

    if (!title) {
      return { status: "error" as const, message: "Lesson title is required" };
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return { status: "error" as const, message: "Lesson not found" };
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        description,
        notes,
        bunnyLibraryId,
        bunnyVideoId,
        isPreview,
      },
    });

    revalidatePath("/admin/courses");

    return { status: "success" as const, message: "Lesson updated successfully" };
  } catch (error) {
    return {
      status: "error" as const,
      message:
        error instanceof Error ? error.message : "Failed to update lesson",
    };
  }
}

export async function deleteLesson(lessonId: string) {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  revalidatePath("/admin/courses");
}