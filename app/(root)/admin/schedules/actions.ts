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

export async function createSchedule(formData: FormData) {
  try {
    await requireAdmin();

    const branchId = formData.get("branchId") as string;
    const level = formData.get("level") as string | null;
    const description = formData.get("description") as string | null;
    const rawEntries = formData.get("entries") as string;

    if (!branchId) {
      return { success: false, message: "Branch selection is required." };
    }

    let entries: Array<{
      day: WeekDay;
      startDate: string;
      date: string;
      startTime: string;
      endTime: string;
    }> = [];

    if (rawEntries) {
      try {
        entries = JSON.parse(rawEntries);
      } catch (e) {
        return { success: false, message: "Invalid schedule entries format." };
      }
    }

    const createdSchedule = await prisma.schedule.create({
      data: {
        branchId,
        level: level?.trim() || null,
        description: description?.trim() || null,
        entries: {
          create: entries.map((entry) => ({
            day: entry.day,
            startDate: new Date(entry.startDate || entry.date),
            date: new Date(entry.date),
            startTime: entry.startTime,
            endTime: entry.endTime,
          })),
        },
      },
    });

    revalidatePath("/admin/schedules");
    return { success: true, scheduleId: createdSchedule.id };
  } catch (error) {
    console.error("Error creating schedule:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create schedule",
    };
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