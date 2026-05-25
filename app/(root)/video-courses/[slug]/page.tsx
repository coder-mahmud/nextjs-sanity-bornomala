// app/video-courses/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import BuyCourseButton from "@/components/courses/BuyCourseButton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function VideoCourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params (Next.js 14 async server component)
  const { slug } = await params;

  // Fetch course by slug
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) redirect("/video-courses");

  // Check user session
  const session = await auth();

  // Check if user has purchased this course
  let hasPurchased = false;
  if (session?.user?.id) {
    const access = await prisma.courseAccess.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    hasPurchased = !!access;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{course.title}</CardTitle>
          </CardHeader>

          <CardContent>
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            {course.shortDescription && (
              <CardDescription className="text-gray-700 mb-6">
                {course.shortDescription}
              </CardDescription>
            )}

            {course.description && (
              <p className="text-gray-700 mb-6">{course.description}</p>
            )}

            {/* Action Buttons */}
            {!session && (
              <Link
                href={`/login?callbackUrl=/video-courses/${course.slug}`}
                className="inline-block rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Login to Take Course
              </Link>
            )}

            {session && !hasPurchased && (
              <BuyCourseButton courseId={course.id} />
            )}

            {session && hasPurchased && (
              <Link
                href={`/dashboard/courses/${course.slug}`}
                className="inline-block rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700"
              >
                Go to Course
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}