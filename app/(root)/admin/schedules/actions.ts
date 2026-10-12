"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { WeekDay } from "@/prisma/generated/prisma/enums";

async function requireAdmin() {
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
  ) {
    throw new Error("Unauthorized access");
  }

  return session;
}


// actions.ts
export async function createSchedule(formData: FormData) {
  try {
    const branchId = formData.get("branchId") as string;
    const level = formData.get("level") as string;
    const tag = formData.get("tag") as string; // Added tag field
    const description = formData.get("description") as string;
    const entriesRaw = formData.get("entries") as string;

    const entries = JSON.parse(entriesRaw) as {
      day: string;
      time: string;
      startingDate: string;
    }[];

    await prisma.schedule.create({
      data: {
        branchId,
        level,
        tag, // Included in prisma create payload
        description,
        entries: {
          create: entries.map((entry) => ({
            day: entry.day,
            time: entry.time,
            startingDate: entry.startingDate,
          })),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return { success: false, message: "Server error creating schedule" };
  }
}

export async function updateSchedule(scheduleId: string, formData: FormData) {
  try {
    const branchId = formData.get("branchId") as string;
    const courseId = formData.get("courseId") as string;
    const level = formData.get("level") as string;
    const tag = formData.get("tag") as string; // Added tag field
    const description = formData.get("description") as string;
    const entriesRaw = formData.get("entries") as string;

    const entries = JSON.parse(entriesRaw) as {
      day: string;
      time: string;
      startingDate: string;
    }[];

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    const isParis = branch?.name.toLowerCase().includes("paris");

    // Clear previous course connections and update entries within a transaction
    await prisma.$transaction([
      prisma.scheduleEntry.deleteMany({
        where: { scheduleId },
      }),
      prisma.course.updateMany({
        where: isParis ? { parisScheduleId: scheduleId } : { hocheScheduleId: scheduleId },
        data: isParis ? { parisScheduleId: null } : { hocheScheduleId: null },
      }),
      prisma.schedule.update({
        where: { id: scheduleId },
        data: {
          branchId,
          level,
          tag, // Included tag field in update payload
          description,
          entries: {
            create: entries.map((entry) => ({
              day: entry.day,
              time: entry.time,
              startingDate: entry.startingDate,
            })),
          },
        },
      }),
    ]);

    // Connect the newly chosen course
    if (courseId) {
      await prisma.course.update({
        where: { id: courseId },
        data: isParis
          ? { parisScheduleId: scheduleId }
          : { hocheScheduleId: scheduleId },
      });
    }

    revalidatePath("/admin/schedules");
    revalidatePath("/courses");

    return { success: true };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { success: false, message: "Server error updating schedule." };
  }
}

export async function deleteSchedule(scheduleId: string) {
  try {
    await requireAdmin();

    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    revalidatePath("/admin/schedules");
    return { success: true };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete schedule",
    };
  }
}