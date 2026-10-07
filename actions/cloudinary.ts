"use server";

import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Extracts the public_id (including folder path) from a Cloudinary URL
 */
function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    // Remove version string (e.g., v123456789/) if present
    const pathAfterUpload = parts[1].replace(/^v\d+\//, "");

    // Strip extension (.jpg, .png, etc.)
    const publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf("."));
    return publicId || null;
  } catch {
    return null;
  }
}

export async function deleteCloudinaryImage(imageUrl: string) {
  // Ensure the user is authenticated/authorized before deleting assets
  const session = await auth();
  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
    throw new Error("Unauthorized");
  }

  const publicId = getPublicIdFromUrl(imageUrl);
  if (!publicId) {
    return { success: false, error: "Invalid image URL" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      return { success: true };
    }
    return { success: false, error: result.result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete image",
    };
  }
}