// components/shared/courses/CourseVideoModalButton.tsx
"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1]?.split("&")[0];
  } else if (url.includes("embed/")) {
    videoId = url.split("embed/")[1]?.split("?")[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
}

export default function CourseVideoModalButton({ videoUrl }: { videoUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!videoUrl) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>প্রিভিউ ভিডিও দেখুন</span>
      </button>

      {/* Video Modal Popup with backdrop blur overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md backdrop-filter p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 bg-gray-900/90 hover:bg-red-600 text-white p-2.5 rounded-full transition cursor-pointer shadow-lg"
              aria-label="Close video modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(videoUrl)}
                title="Course Video Preview"
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}