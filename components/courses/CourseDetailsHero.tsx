// components/courses/CourseDetailsHero.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Award, Video, MapPin, Play, X } from "lucide-react";
import CoursePurchaseBox from "@/components/courses/CoursePurchaseBox";

function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";
  let videoId = "";
  
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1]?.split("&")[0];
  } else if (url.includes("embed/")) {
    videoId = url.split("embed/")[1]?.split("?")[0];
  } else if (url.includes("shorts/")) {
    videoId = url.split("shorts/")[1]?.split("?")[0];
  }

  // Fallback if raw ID was provided
  if (!videoId && url.length === 11) {
    videoId = url;
  }

  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : url;
}

export default function CourseDetailsHero({
  course,
  isOnline,
  session,
  hasPurchased,
  offlineSchedules,
}: {
  course: any;
  isOnline: boolean;
  session: any;
  hasPurchased: boolean;
  offlineSchedules: any[];
}) {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure portals only render on the client side after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        {course.tagLine && (
          <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
            {course.tagLine}
          </span>
        )}
        {course.isExamCivique && (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
            <Award className="w-4 h-4" /> Exam Civique
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
            isOnline ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
          }`}
        >
          {isOnline ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
          {course.courseType}
        </span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-gray-900">{course.title}</h1>
      {course.shortDescription && (
        <p className="text-xl text-gray-700">{course.shortDescription}</p>
      )}

      <div className="flex flex-wrap gap-4 text-gray-700">
        {course.duration && (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 00-1.414 0l4-4z"></path>
            </svg>
            <span>{course.duration}</span>
          </div>
        )}
        {course.numberOfStudents && (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 00-1.414 0l4-4z"></path>
            </svg>
            <span>{course.numberOfStudents} শিক্ষার্থী</span>
          </div>
        )}
        {course.rating && (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-0.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{course.rating}</span>
          </div>
        )}
        <div className="flex items-center font-bold text-emerald-700">
          <span>মূল্য: {course.price?.toString()} {course.currency || "EUR"}</span>
        </div>
      </div>

      {/* Action Buttons & Preview Trigger */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl transition font-medium"
        >
          পরামর্শের জন্য যোগাযোগ করুন
        </Link>

        {isOnline && (
          <CoursePurchaseBox
            courseId={course.id}
            courseSlug={course.slug}
            session={session}
            hasPurchased={hasPurchased}
          />
        )}

        {course.courseVideo && (
          <button
            type="button"
            onClick={() => setActiveVideoUrl(course.courseVideo)}
            className="inline-flex items-center gap-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>প্রিভিউ ভিডিও দেখুন</span>
          </button>
        )}
      </div>

      {/* OFFLINE SCHEDULES */}
      {!isOnline && (
        <div className="mt-8 pt-6 border-t border-gray-200/60">
          <h2 className="text-xl font-bold text-gray-900 mb-4">শিডিউল ও স্থান</h2>
          {offlineSchedules.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-2">কোনো শিডিউল পাওয়া যায়নি</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offlineSchedules.map((item, index: number) => {
                const schedule = item.schedule;
                const branchName = schedule.branch?.name || item.name;

                return (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-md space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                      {branchName}
                    </h3>
                    {schedule.description && (
                      <p className="text-xs text-gray-600">{schedule.description}</p>
                    )}

                    <div className="space-y-2 pt-1">
                      {schedule.entries &&
                        schedule.entries.map((entry: any, dayIndex: number) => (
                          <div key={dayIndex} className="text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex flex-col">
                            <span className="font-semibold text-gray-800 text-sm">{entry.day}</span>
                            <span className="text-gray-600 text-xs mt-0.5">{entry.time}</span>
                            <span className="text-gray-500 text-[11px] mt-0.5">ক্লাস স্টার্ট: {entry.startingDate}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Render Portal directly to document.body so modal escapes parent containers & transform bounds */}
      {mounted && activeVideoUrl && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <button
              type="button"
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 z-10 bg-gray-900/80 hover:bg-red-600 text-white p-2.5 rounded-full transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(activeVideoUrl)}
                title="Course Video Preview"
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}