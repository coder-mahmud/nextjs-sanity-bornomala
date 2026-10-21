"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === "object" && typeof data.toNumber === "function") return data.toNumber();
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(sanitizeData);
  if (typeof data === "object") {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      sanitized[key] = sanitizeData(data[key]);
    }
    return sanitized;
  }
  return data;
}

export async function getInventories() {
  try {
    const inventories = await prisma.inventory.findMany({
      include: { students: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: sanitizeData(inventories) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getInventoryById(id: string) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: { students: true },
    });
    if (!inventory) return { success: false, error: "Inventory not found" };
    return { success: true, data: sanitizeData(inventory) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createInventory(formData: {
  title: string;
  students: Array<{
    identity?: string;
    lastName: string;
    firstName: string;
    phoneNumber?: string;
    subscriptionDate?: string;
    tarif: number;
    deduit: number;
    paye: number;
    birthPlace?: string;
    city?: string;
    comment?: string;
  }>;
}) {
  try {
    const { title, students } = formData;

    await prisma.inventory.create({
      data: {
        title,
        students: {
          create: students.map((s) => {
            const tarif = Number(s.tarif) || 0;
            const deduit = Number(s.deduit) || 0;
            const paye = Number(s.paye) || 0;
            const aRegler = tarif - deduit - paye;

            return {
              identity: s.identity || null,
              lastName: s.lastName,
              firstName: s.firstName,
              phoneNumber: s.phoneNumber || null,
              subscriptionDate: s.subscriptionDate ? new Date(s.subscriptionDate) : null,
              tarif,
              deduit,
              paye,
              aRegler,
              birthPlace: s.birthPlace || null,
              city: s.city || null,
              comment: s.comment || null,
            };
          }),
        },
      },
    });

    revalidatePath("/admin/inventories");
    return { success: true, message: "Inventory created successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create inventory" };
  }
}

export async function updateInventory(
  id: string,
  formData: {
    title: string;
    students: Array<{
      id?: string;
      identity?: string;
      lastName: string;
      firstName: string;
      phoneNumber?: string;
      subscriptionDate?: string;
      tarif: number;
      deduit: number;
      paye: number;
      birthPlace?: string;
      city?: string;
      comment?: string;
    }>;
  }
) {
  try {
    const { title, students } = formData;

    await prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { id },
        data: { title },
      });

      const existingStudents = await tx.student.findMany({
        where: { inventoryId: id },
        select: { id: true },
      });
      const existingIds = existingStudents.map((s) => s.id);
      const incomingIds = students.filter((s) => s.id).map((s) => s.id!);

      const idsToDelete = existingIds.filter((dbId) => !incomingIds.includes(dbId));
      if (idsToDelete.length > 0) {
        await tx.student.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      for (const s of students) {
        const tarif = Number(s.tarif) || 0;
        const deduit = Number(s.deduit) || 0;
        const paye = Number(s.paye) || 0;
        const aRegler = tarif - deduit - paye;

        const studentPayload = {
          identity: s.identity || null,
          lastName: s.lastName,
          firstName: s.firstName,
          phoneNumber: s.phoneNumber || null,
          subscriptionDate: s.subscriptionDate ? new Date(s.subscriptionDate) : null,
          tarif,
          deduit,
          paye,
          aRegler,
          birthPlace: s.birthPlace || null,
          city: s.city || null,
          comment: s.comment || null,
        };

        if (s.id && existingIds.includes(s.id)) {
          await tx.student.update({
            where: { id: s.id },
            data: studentPayload,
          });
        } else {
          await tx.student.create({
            data: {
              inventoryId: id,
              ...studentPayload,
            },
          });
        }
      }
    });

    revalidatePath("/admin/inventories");
    revalidatePath(`/admin/inventories/${id}`);
    return { success: true, message: "Inventory updated successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update inventory" };
  }
}

export async function deleteInventory(id: string) {
  try {
    await prisma.inventory.delete({ where: { id } });
    revalidatePath("/admin/inventories");
    return { success: true, message: "Inventory deleted successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete inventory" };
  }
}