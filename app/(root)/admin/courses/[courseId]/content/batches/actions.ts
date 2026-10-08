"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createBatch(prevState: any, formData: FormData) {
  try {
    const courseId = formData.get("courseId") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const meetingPlatform = formData.get("meetingPlatform") as string;
    const meetingLink = formData.get("meetingLink") as string;
    const meetingPassword = formData.get("meetingPassword") as string;
    const maxStudents = formData.get("maxStudents") as string;
    const status = formData.get("status") as any;

    if (!courseId || !title || !slug) {
      return { status: "error", message: "Course, title, and slug are required." };
    }

    const existingSlug = await prisma.batch.findUnique({ where: { slug } });
    if (existingSlug) {
      return { status: "error", message: "Batch slug must be unique." };
    }

    await prisma.batch.create({
      data: {
        courseId,
        title,
        slug,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        meetingPlatform: meetingPlatform || null,
        meetingLink: meetingLink || null,
        meetingPassword: meetingPassword || null,
        maxStudents: maxStudents ? parseInt(maxStudents, 10) : null,
        status: status || "UPCOMING",
      },
    });

    revalidatePath(`/admin/courses/${courseId}/content`);
    return { status: "success", message: "Batch created successfully!" };
  } catch (error: any) {
    console.error("Failed to create batch:", error);
    return { status: "error", message: error.message || "Failed to create batch." };
  }
}

export async function updateBatch(batchId: string, courseId: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const meetingPlatform = formData.get("meetingPlatform") as string;
    const meetingLink = formData.get("meetingLink") as string;
    const meetingPassword = formData.get("meetingPassword") as string;
    const maxStudents = formData.get("maxStudents") as string;
    const status = formData.get("status") as any;

    if (!batchId || !title || !slug) {
      return { status: "error", message: "Batch ID, title, and slug are required." };
    }

    // Check if slug belongs to another batch
    const existingSlug = await prisma.batch.findFirst({
      where: {
        slug,
        NOT: { id: batchId },
      },
    });

    if (existingSlug) {
      return { status: "error", message: "Batch slug must be unique." };
    }

    await prisma.batch.update({
      where: { id: batchId },
      data: {
        title,
        slug,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        meetingPlatform: meetingPlatform || null,
        meetingLink: meetingLink || null,
        meetingPassword: meetingPassword || null,
        maxStudents: maxStudents ? parseInt(maxStudents, 10) : null,
        status: status || "UPCOMING",
      },
    });

    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/admin/courses/${courseId}`);
    return { status: "success", message: "Batch updated successfully!" };
  } catch (error: any) {
    console.error("Failed to update batch:", error);
    return { status: "error", message: error.message || "Failed to update batch." };
  }
}

export async function deleteBatch(batchId: string, courseId: string) {
  try {
    await prisma.batch.delete({
      where: { id: batchId },
    });

    revalidatePath(`/admin/courses/${courseId}/content`);
    return { status: "success", message: "Batch deleted successfully!" };
  } catch (error: any) {
    console.error("Failed to delete batch:", error);
    return { status: "error", message: error.message || "Failed to delete batch." };
  }
}