// app/admin/users/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function createUser(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "SUPERADMIN") {
      return { status: "error", message: "Unauthorized action." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "STUDENT" | "USER" | "ADMIN" | "SUPERADMIN";

    if (!email || !password || !role) {
      return { status: "error", message: "Email, password, and role are required." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { status: "error", message: "User with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      },
    });

    revalidatePath("/admin/users");
    return { status: "success", message: "User created successfully! 🎉" };
  } catch (error: any) {
    console.error("Failed to create user:", error);
    return { status: "error", message: error.message || "Failed to create user." };
  }
}