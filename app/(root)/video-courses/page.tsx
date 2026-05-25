// app/courses/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Users, Star } from "lucide-react";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
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
          {courses.map((course) => (
            <Card key={course.id} className="shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">{course.title}</CardTitle>
                </div>
                {course.shortDescription && (
                  <CardDescription className="text-gray-700 text-base">{course.shortDescription}</CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary" /> <span>সময়কাল: {course.durationMinutes || "N/A"} min</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-primary" /> <span>শিক্ষার্থী: 0</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-primary" /> <span>রেটিং: 5.0</span>
                  </div>
                </div>
              </CardContent>

              <div className="px-6 pb-6 mt-auto">
                <Link
                  href={`/video-courses/${course.slug}`}
                  className="w-full inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-center"
                >
                  Take Course
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}