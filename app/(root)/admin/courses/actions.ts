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

function getJsonArray(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
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
    const instructorId = getNullableString(formData, "instructorId") || undefined;
    const parisScheduleId = getNullableString(formData, "parisScheduleId") || undefined;
    const hocheScheduleId = getNullableString(formData, "hocheScheduleId") || undefined;
    const order = getNullableNumber(formData, "order");
    const status = ((formData.get("status") as string) || "DRAFT") as CourseStatus;
  
    const characteristics = getStringArray(formData, "characteristics");
    const targetAudience = getStringArray(formData, "targetAudience");
    const faqs = getJsonArray(formData, "faqs");
    const cards = getJsonArray(formData, "cards");
  
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
        parisScheduleId,
        hocheScheduleId,
        order,
        status,
        characteristics,
        targetAudience,
        faqs: faqs ?? undefined,
        cards:
          cards && Array.isArray(cards) && cards.length > 0
            ? {
                create: cards.map((c: any, index: number) => ({
                  title: c.title,
                  description: c.description || null,
                  image: c.image || null,
                  order: Number(c.order) ?? index,
                })),
              }
            : undefined,
      },
    });
  
    revalidatePath("/admin/courses");
    return { success: true, courseId: course.id };
  }

  export async function updateCourse(courseId: string, formData: FormData) {
    try {
      await requireAdmin();
  
      const title = getString(formData, "title");
      const rawSlug = getString(formData, "slug");
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
      const instructorId = getNullableString(formData, "instructorId");
      const parisScheduleId = getNullableString(formData, "parisScheduleId");
      const hocheScheduleId = getNullableString(formData, "hocheScheduleId");
      const order = getNullableNumber(formData, "order");
      const status = ((formData.get("status") as string) || "DRAFT") as CourseStatus;
  
      const characteristics = getStringArray(formData, "characteristics");
      const targetAudience = getStringArray(formData, "targetAudience");
      const faqs = getJsonArray(formData, "faqs");
      const cards = getJsonArray(formData, "cards");
  
      if (!title) {
        return { success: false, message: "Course title is required" };
      }
  
      const formattedSlug = slugify(rawSlug || title) || "course";
  
      // Check if another course already uses this slug
      const existingCourseWithSlug = await prisma.course.findFirst({
        where: {
          slug: formattedSlug,
          NOT: { id: courseId },
        },
      });
  
      if (existingCourseWithSlug) {
        return { 
          success: false, 
          message: `The slug "${formattedSlug}" is already taken by another course. Please choose a unique slug.` 
        };
      }
  
      await prisma.$transaction(async (tx) => {
        // Update course fields
        await tx.course.update({
          where: { id: courseId },
          data: {
            title,
            slug: formattedSlug,
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
            instructor: instructorId
              ? { connect: { id: instructorId } }
              : { disconnect: true },
            parisSchedule: parisScheduleId
              ? { connect: { id: parisScheduleId } }
              : { disconnect: true },
            hocheSchedule: hocheScheduleId
              ? { connect: { id: hocheScheduleId } }
              : { disconnect: true },
            order,
            status,
            characteristics,
            targetAudience,
            faqs: faqs ?? undefined,
          },
        });
  
        // Refresh course cards: delete existing and create new ones
        await tx.courseCard.deleteMany({
          where: { courseId },
        });
  
        if (cards && Array.isArray(cards) && cards.length > 0) {
          await tx.courseCard.createMany({
            data: cards.map((c: any, index: number) => ({
              courseId,
              title: c.title,
              description: c.description || null,
              image: c.image || null,
              order: Number(c.order) ?? index,
            })),
          });
        }
      });
  
      revalidatePath("/admin/courses");
      revalidatePath(`/admin/courses/${courseId}`);
      revalidatePath(`/admin/courses/${courseId}/edit`);
      revalidatePath("/courses");
  
      return { success: true };
    } catch (error) {
      console.error("Course update error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to update course." 
      };
    }
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
   LESSON ACTIONS (LINKED TO BATCH & QUIZ)
   ========================================== */

   export async function createLesson(
    _previousState: {
      status: "success" | "error";
      message: string;
    } | null,
    formData: FormData
  ) {
    try {
      await requireAdmin();
  
      const title = getString(formData, "title");
      const rawSlug = getString(formData, "slug");
      const description = getNullableString(formData, "description");
      const notes = getNullableString(formData, "notes");
      const videoUrl = getNullableString(formData, "videoUrl");
      const bunnyLibraryId = getNullableString(formData, "bunnyLibraryId");
      const bunnyVideoId = getNullableString(formData, "bunnyVideoId");
      const batchId = getNullableString(formData, "batchId");
      const quizId = getNullableString(formData, "quizId");
      const isPreview = formData.get("isPreview") === "on";
  
      if (!title) {
        return { status: "error" as const, message: "Lesson title is required" };
      }
  
      if (!batchId) {
        return { status: "error" as const, message: "A batch must be assigned" };
      }
  
      const slug = await createUniqueLessonSlug(rawSlug || title);
  
      let requestedOrder = getNullableNumber(formData, "order");
  
      if (requestedOrder === null) {
        const maxLesson = await prisma.lesson.findFirst({
          where: { batchId },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        requestedOrder = (maxLesson?.order ?? 0) + 1;
      } else {
        await prisma.lesson.updateMany({
          where: {
            batchId,
            order: { gte: requestedOrder },
          },
          data: {
            order: { increment: 1 },
          },
        });
      }
  
      const parseValidDate = (dateStr: string | null) => {
        if (!dateStr || dateStr.trim() === "") return null;
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
      };
  
      const startsAt = parseValidDate(getNullableString(formData, "startsAt"));
      const endsAt = parseValidDate(getNullableString(formData, "endsAt"));
  
      const attachmentsRaw = formData.get("attachments");
      let attachments: string[] = [];
      if (typeof attachmentsRaw === "string" && attachmentsRaw.trim() !== "") {
        try {
          attachments = JSON.parse(attachmentsRaw);
        } catch (e) {
          attachments = [];
        }
      }
  
      await prisma.lesson.create({
        data: {
          title,
          slug,
          description,
          notes,
          videoUrl,
          bunnyLibraryId,
          bunnyVideoId,
          order: requestedOrder,
          isPreview,
          startsAt,
          endsAt,
          attachments,
          batch: { connect: { id: batchId } },
          quiz: quizId ? { connect: { id: quizId } } : undefined,
        },
      });
  
      revalidatePath("/admin/courses");
  
      return { status: "success" as const, message: "Lesson created successfully" };
    } catch (error) {
      console.error("Create lesson error:", error);
      return {
        status: "error" as const,
        message: error instanceof Error ? error.message : "Failed to create lesson",
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
      const slug = getString(formData, "slug");
      const description = getNullableString(formData, "description");
      const notes = getNullableString(formData, "notes");
      const videoUrl = getNullableString(formData, "videoUrl");
      const bunnyLibraryId = getNullableString(formData, "bunnyLibraryId");
      const bunnyVideoId = getNullableString(formData, "bunnyVideoId");
      const batchId = getNullableString(formData, "batchId");
      const quizId = getNullableString(formData, "quizId");
      const order = getNullableNumber(formData, "order") ?? 1;
      const isPreview = formData.get("isPreview") === "on";
  
      const parseValidDate = (dateStr: string | null) => {
        if (!dateStr || dateStr.trim() === "") return null;
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
      };
  
      const startsAt = parseValidDate(getNullableString(formData, "startsAt"));
      const endsAt = parseValidDate(getNullableString(formData, "endsAt"));
  
      const attachmentsRaw = formData.get("attachments");
      let attachments: string[] = [];
      if (typeof attachmentsRaw === "string" && attachmentsRaw.trim() !== "") {
        try {
          attachments = JSON.parse(attachmentsRaw);
        } catch (e) {
          attachments = [];
        }
      }
  
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
          slug: slug || lesson.slug,
          description,
          notes,
          videoUrl,
          bunnyLibraryId,
          bunnyVideoId,
          order,
          isPreview,
          startsAt,
          endsAt,
          attachments,
          batch: batchId
            ? { connect: { id: batchId } }
            : { disconnect: true },
          quiz: quizId
            ? { connect: { id: quizId } }
            : { disconnect: true },
        },
      });
  
      revalidatePath("/admin/courses");
  
      return { status: "success" as const, message: "Lesson updated successfully" };
    } catch (error) {
      console.error("Prisma lesson update error:", error);
      return {
        status: "error" as const,
        message:
          error instanceof Error ? error.message : "Failed to update lesson",
      };
    }
  }
  
  export async function deleteLesson(lessonId: string) {
    try {
      await requireAdmin();
  
      await prisma.lesson.delete({
        where: { id: lessonId },
      });
  
      revalidatePath("/admin/courses");
  
      return { status: "success" as const, message: "Lesson deleted successfully" };
    } catch (error) {
      console.error("Delete lesson error:", error);
      return {
        status: "error" as const,
        message: error instanceof Error ? error.message : "Failed to delete lesson",
      };
    }
  }