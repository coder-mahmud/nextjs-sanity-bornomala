"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Star, Video, MapPin, Play, X } from "lucide-react";
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

interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  tagLine?: string;
  duration?: string;
  numberOfStudents?: string;
  rating?: string;
  characteristics?: string[];
  courseType: "ONLINE" | "OFFLINE";
  courseVideo?: string;
}

interface AllCoursesClientProps {
  courses: Course[];
  session: any;
  userAccesses?: string[]; // Array of course IDs the user has purchased
}

export default function AllCoursesClient({
  courses,
  session,
  userAccesses = [],
}: AllCoursesClientProps) {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const onlineCourses = courses.filter((c) => c.courseType === "ONLINE");
  const offlineCourses = courses.filter((c) => c.courseType === "OFFLINE");

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section Header */}
      <section className="py-16 bg-gray-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-2" /> আমাদের কোর্সসমূহ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আপনার প্রয়োজন অনুযায়ী কোর্স নির্বাচন করুন
          </h2>
          <p className="text-lg text-gray-700">
            বিগিনার থেকে অ্যাডভান্সড লেভেল পর্যন্ত বিভিন্ন কোর্স যা আপনার লক্ষ্য অর্জনে সাহায্য করবে
          </p>
        </div>
      </section>

      {/* Online Courses Section */}
      {onlineCourses.length > 0 && (
        <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8 border-b pb-4">
            <Video className="w-7 h-7 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900">অনলাইন কোর্সসমূহ (Online Courses)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {onlineCourses.map((course, idx) => (
              <CourseCardItem
                key={course.id}
                course={course}
                idx={idx}
                onOpenVideo={(url) => setActiveVideoUrl(url)}
                isOnline={true}
                session={session}
                hasPurchased={userAccesses.includes(course.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Offline Courses Section */}
      {offlineCourses.length > 0 && (
        <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-8 border-b pb-4">
            <MapPin className="w-7 h-7 text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-900">অফলাইন কোর্সসমূহ (Offline Courses)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offlineCourses.map((course, idx) => (
              <CourseCardItem
                key={course.id}
                course={course}
                idx={idx}
                onOpenVideo={(url) => setActiveVideoUrl(url)}
                isOnline={false}
                session={session}
                hasPurchased={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* YouTube Video Modal Popup */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <button
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
        </div>
      )}
    </div>
  );
}

function CourseCardItem({
  course,
  idx,
  onOpenVideo,
  isOnline,
  session,
  hasPurchased,
}: {
  course: Course;
  idx: number;
  onOpenVideo: (url: string) => void;
  isOnline: boolean;
  session: any;
  hasPurchased: boolean;
}) {
  return (
    <Card
      data-aos="fade-up"
      data-aos-offset="0"
      data-aos-duration="1000"
      data-aos-delay={idx * 100}
      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white"
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-bold text-gray-900">
            {course.title}
          </CardTitle>
          {course.tagLine && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded">
              {course.tagLine}
            </span>
          )}
        </div>
        {course.shortDescription && (
          <CardDescription className="text-gray-700 text-base">
            {course.shortDescription}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="grow">
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <span>সময়কাল: {course.duration || "N/A"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 text-primary" />
            <span>শিক্ষার্থী: {course.numberOfStudents || "0"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="w-4 h-4 mr-2 text-primary" />
            <span>রেটিং: {course.rating || "5.0"}</span>
          </div>
        </div>

        {course.characteristics && course.characteristics.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">কোর্সের বৈশিষ্ট্য:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {course.characteristics.map((item, charIdx) => (
                <li key={charIdx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <div className="px-6 pb-6 mt-auto space-y-2">
        {/* Preview Video Modal Button */}
        {course.courseVideo && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenVideo(course.courseVideo!)}
            className="w-full flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>প্রিভিউ ভিডিও দেখুন</span>
          </Button>
        )}

        {/* Action Button Grid */}
        <div className="grid grid-cols-1 gap-2">
            <Link className="w-full"  href={`/courses/${course.slug}`}>
            <button className="inline-flex items-center justify-center gap-2 rounded bg-[#3a7867] px-8 py-3 text-white hover:bg-white border border-[#3a7867] hover:text-[#3a7867] font-semibold cursor-pointer w-full">

              See Details
            </button>
            </Link>


          {isOnline ? (
            /* Same Purchase Component & Functionality as Course Details Page */
            <div className="w-full [&_button]:w-full">
              <CoursePurchaseBox
                courseId={course.id}
                courseSlug={course.slug}
                session={session}
                hasPurchased={hasPurchased}
              />
            </div>
          ) : (
            null
          )}
        </div>
      </div>
    </Card>
  );
}