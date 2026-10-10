// app/admin/instructors/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicIdFromUrl(url: string) {
  if (!url) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let pathPart = parts[1];
    if (pathPart.startsWith("v")) {
      const slashIndex = pathPart.indexOf("/");
      if (slashIndex !== -1) {
        pathPart = pathPart.substring(slashIndex + 1);
      }
    }
    const lastDotIndex = pathPart.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      pathPart = pathPart.substring(0, lastDotIndex);
    }
    return pathPart;
  } catch {
    return null;
  }
}

export async function createInstructor(formData: FormData) {
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  const designation = formData.get("designation") as string;
  const experience = formData.get("experience") as string;
  const studentCount = parseInt(formData.get("studentCount") as string) || 0;
  const courseCount = parseInt(formData.get("courseCount") as string) || 0;
  const rating = formData.get("rating") ? parseFloat(formData.get("rating") as string) : null;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  
  const imagePublicId = getPublicIdFromUrl(imageUrl);
  
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split("\n").map((t) => t.trim()).filter(Boolean) : [];

  try {
    await prisma.instructor.create({
      data: {
        name,
        title,
        designation,
        experience,
        studentCount,
        courseCount,
        rating,
        description,
        imageUrl,
        imagePublicId,
        tags,
      },
    });
  } catch (error) {
    console.error("Failed to create instructor:", error);
    return { success: false, error: "Failed to create instructor" };
  }

  revalidatePath("/admin/instructors");
  return { success: true };
}

export async function updateInstructor(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  const designation = formData.get("designation") as string;
  const experience = formData.get("experience") as string;
  const studentCount = parseInt(formData.get("studentCount") as string) || 0;
  const courseCount = parseInt(formData.get("courseCount") as string) || 0;
  const rating = formData.get("rating") ? parseFloat(formData.get("rating") as string) : null;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split("\n").map((t) => t.trim()).filter(Boolean) : [];

  try {
    // 1. Fetch current instructor to check existing image info
    const existingInstructor = await prisma.instructor.findUnique({
      where: { id },
      select: { imagePublicId: true, imageUrl: true },
    });

    let finalImageUrl = imageUrl;
    let finalPublicId = getPublicIdFromUrl(imageUrl);

    // If no new image URL was submitted, keep the existing one from the database!
    if (!finalImageUrl && existingInstructor?.imageUrl) {
      finalImageUrl = existingInstructor.imageUrl;
      finalPublicId = existingInstructor.imagePublicId;
    } else if (
      finalImageUrl &&
      existingInstructor?.imagePublicId &&
      existingInstructor.imageUrl !== finalImageUrl
    ) {
      // If a brand new image was uploaded and it's different, delete the old file from Cloudinary
      await cloudinary.uploader.destroy(existingInstructor.imagePublicId);
    }

    // 2. Update database record safely
    await prisma.instructor.update({
      where: { id },
      data: {
        name,
        title,
        designation,
        experience,
        studentCount,
        courseCount,
        rating,
        description,
        imageUrl: finalImageUrl,
        imagePublicId: finalPublicId,
        tags,
      },
    });
  } catch (error) {
    console.error("Failed to update instructor:", error);
    return { success: false, error: "Failed to update instructor" };
  }

  revalidatePath("/admin/instructors");
  revalidatePath(`/admin/instructors/${id}`);
  return { success: true };
}

export async function deleteInstructor(id: string) {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id },
      select: { imagePublicId: true },
    });

    if (instructor?.imagePublicId) {
      await cloudinary.uploader.destroy(instructor.imagePublicId);
    }

    await prisma.instructor.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete instructor:", error);
    return { success: false, error: "Failed to delete instructor" };
  }

  revalidatePath("/admin/instructors");
  return { success: true };
}