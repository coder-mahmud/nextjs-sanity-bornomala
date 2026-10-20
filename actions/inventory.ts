"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Foolproof serializer that converts Decimals, Dates, and complex objects into plain JSON primitives
function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "object" && typeof data.toNumber === "function") {
    return data.toNumber();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

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
      include: {
        students: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const plainInventories = JSON.parse(JSON.stringify(inventories, (key, value) => {
      if (value !== null && typeof value === "object" && "s" in value && "e" in value && "d" in value) {
        return Number(value.toString());
      }
      return value;
    }));

    return { success: true, data: sanitizeData(plainInventories) };
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

    const plainInventory = JSON.parse(JSON.stringify(inventory, (key, value) => {
      if (value !== null && typeof value === "object" && "s" in value && "e" in value && "d" in value) {
        return Number(value.toString());
      }
      return value;
    }));

    return { success: true, data: sanitizeData(plainInventory) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createInventory(formData: {
  title: string;
  students: Array<{
    studentId?: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    subscriptionDate?: string;
    totalAmount: number;
    discount: number;
    paidAmount: number;
    paymentDates?: string[];
    location: "PARIS" | "HOCHE" | "ONLINE";
  }>;
}) {
  try {
    const { title, students } = formData;

    await prisma.inventory.create({
      data: {
        title,
        students: {
          create: students.map((s) => {
            const total = Number(s.totalAmount) || 0;
            const discount = Number(s.discount) || 0;
            const paid = Number(s.paidAmount) || 0;
            const due = total - discount - paid;

            return {
              studentId: s.studentId || null,
              firstName: s.firstName,
              lastName: s.lastName,
              phoneNumber: s.phoneNumber || null,
              subscriptionDate: s.subscriptionDate ? new Date(s.subscriptionDate) : null,
              totalAmount: total,
              discount: discount,
              paidAmount: paid,
              paymentDates: s.paymentDates ? s.paymentDates.filter(Boolean).map((d) => new Date(d)) : [],
              due: due,
              location: s.location,
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
      studentId?: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      subscriptionDate?: string;
      totalAmount: number;
      discount: number;
      paidAmount: number;
      paymentDates?: string[];
      location: "PARIS" | "HOCHE" | "ONLINE";
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
        const total = Number(s.totalAmount) || 0;
        const discount = Number(s.discount) || 0;
        const paid = Number(s.paidAmount) || 0;
        const due = total - discount - paid;

        const studentPayload = {
          studentId: s.studentId || null,
          firstName: s.firstName,
          lastName: s.lastName,
          phoneNumber: s.phoneNumber || null,
          subscriptionDate: s.subscriptionDate ? new Date(s.subscriptionDate) : null,
          totalAmount: total,
          discount,
          paidAmount: paid,
          paymentDates: s.paymentDates ? s.paymentDates.filter(Boolean).map((d) => new Date(d)) : [],
          due,
          location: s.location,
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
    await prisma.inventory.delete({
      where: { id },
    });
    revalidatePath("/admin/inventories");
    return { success: true, message: "Inventory deleted successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete inventory" };
  }
}