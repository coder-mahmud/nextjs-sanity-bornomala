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


export async function updateSchedule(scheduleId: string, formData: FormData) {
  try {
    const branchId = formData.get("branchId") as string;
    const level = formData.get("level") as string;
    const description = formData.get("description") as string;
    const entriesRaw = formData.get("entries") as string;

    const entries = JSON.parse(entriesRaw) as {
      day: string;
      time: string;
      startingDate: string;
    }[];

    // Atomically replace existing entries with updated entries
    await prisma.$transaction([
      prisma.scheduleEntry.deleteMany({
        where: { scheduleId },
      }),
      prisma.schedule.update({
        where: { id: scheduleId },
        data: {
          branchId,
          level,
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

    revalidatePath("/admin/schedules");
    revalidatePath("/courses");

    return { success: true };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { success: false, message: "Server error updating schedule." };
  }
}