// app/courses/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Star } from "lucide-react";

export default async function AllCourses() {
  const rawCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
  });

  // Sort logic: 
  // 1. Explicit positive orders (1, 2, 3...) come first in ascending order.
  // 2. Default/zero orders (0 or null) come after, ordered by oldest to newest (createdAt asc).
  const courses = rawCourses.sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;

    if (orderA > 0 && orderB > 0) {
      return orderA - orderB;
    }
    if (orderA > 0) return -1;
    if (orderB > 0) return 1;

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  if (!courses.length) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">No courses available yet</h2>
        <p className="text-gray-500">Please check back later.</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <Card
              key={course.id}
              data-aos="fade-up"
              data-aos-offset="0"
              data-aos-duration="1000"
              data-aos-delay={idx * 100}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col"
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
              <CardContent className="flex-grow">
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
              <div className="px-6 pb-6 mt-auto">
                <Button asChild className="w-full">
                  <Link href={`/courses/${course.slug}`}>
                    বিস্তারিত দেখুন
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}