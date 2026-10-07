"use client";
import { useState } from "react";
import { deleteCloudinaryImage } from "@/actions/cloudinary";

interface CloudinaryUploadProps {
  name: string;
  label?: string;
  defaultValue?: string;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

export default function CloudinaryUpload({
  name,
  label = "Image",
  defaultValue = "",
  cloudName,
  uploadPreset,
  folder = "courses",
}: CloudinaryUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(defaultValue);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: If an image is already uploaded, delete it from Cloudinary first
      if (imageUrl) {
        setLoadingText("Removing previous image...");
        await deleteCloudinaryImage(imageUrl);
      }

      // Step 2: Upload new file
      setLoadingText("Uploading new image...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      if (folder) {
        formData.append("folder", folder);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleRemove = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setLoadingText("Deleting from Cloudinary...");
    setError(null);

    try {
      const res = await deleteCloudinaryImage(imageUrl);
      if (res.success) {
        setImageUrl("");
      } else {
        setError(res.error || "Failed to delete image from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deletion error");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Hidden input passes the active URL to native form actions */}
      <input type="hidden" name={name} value={imageUrl} />

      {imageUrl ? (
        <div className="relative inline-block border rounded-xl overflow-hidden bg-gray-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Uploaded Preview"
            className="h-36 w-60 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="mt-2 text-xs text-red-600 font-medium hover:underline block disabled:opacity-50"
          >
            {loading ? loadingText : "Remove / Replace"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
          />
          {loading && (
            <span className="text-sm text-gray-500 animate-pulse">
              {loadingText}
            </span>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}