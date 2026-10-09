"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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

export async function createBranch(formData: FormData) {
  try {
    await requireAdmin();

    const name = (formData.get("name") as string)?.trim();
    const address = (formData.get("address") as string)?.trim() || null;

    if (!name) {
      return { success: false, message: "Branch name is required." };
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
      },
    });

    revalidatePath("/admin/branches");
    return { success: true, branchId: branch.id };
  } catch (error) {
    console.error("Error creating branch:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create branch",
    };
  }
}

export async function updateBranch(branchId: string, formData: FormData) {
  try {
    await requireAdmin();

    const name = (formData.get("name") as string)?.trim();
    const address = (formData.get("address") as string)?.trim() || null;

    if (!name) {
      return { success: false, message: "Branch name is required." };
    }

    await prisma.branch.update({
      where: { id: branchId },
      data: {
        name,
        address,
      },
    });

    revalidatePath("/admin/branches");
    return { success: true };
  } catch (error) {
    console.error("Error updating branch:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update branch",
    };
  }
}

export async function deleteBranch(branchId: string) {
  try {
    await requireAdmin();

    await prisma.branch.delete({
      where: { id: branchId },
    });

    revalidatePath("/admin/branches");
    return { success: true };
  } catch (error) {
    console.error("Error deleting branch:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete branch",
    };
  }
}