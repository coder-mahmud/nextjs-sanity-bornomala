// app/(root)/courses/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import FaqBlock from "@/components/shared/FaqBlock";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { auth } from "@/auth";
import CoursePurchaseBox from "@/components/courses/CoursePurchaseBox";

type FAQ = {
  question: string;
  answer: string;
};

// ... (keep your existing courseInclude, getCourse, and generateStaticParams functions as they are)

const courseInclude = {
  instructor: true,
  cards: { orderBy: { order: "asc" } },
  parisSchedule: { include: { branch: true, entries: { orderBy: { createdAt: "asc" } } } },
  hocheSchedule: { include: { branch: true, entries: { orderBy: { createdAt: "asc" } } } },
} satisfies Prisma.CourseInclude;

export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: typeof courseInclude;
}>;

async function getCourse(slug: string): Promise<CourseWithRelations | null> {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: courseInclude,
  });
  return course as CourseWithRelations | null;
}

export async function generateStaticParams() {
  const courses = await prisma.course.findMany({ select: { slug: true } });
  return courses.map((course: { slug: string }) => ({ slug: course.slug }));
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  // Check user session
  const session = await auth();

  // Check if user has purchased this course
  let hasPurchased = false;
  if (session?.user?.id) {
    const access = await prisma.courseAccess.findFirst({
      where: {
        userId: session.user.id,
        courseId: course.id,
      },
    });
    hasPurchased = !!access;
  }

  const faqs = (course.faqs as unknown as FAQ[]) || [];
  const schedules = [
    { name: "Paris", schedule: course.parisSchedule },
    { name: "Hoche", schedule: course.hocheSchedule },
  ].filter(
    (s): s is { name: string; schedule: NonNullable<typeof s.schedule> } =>
      s.schedule !== null
  );

  const instructor = course.instructor;

  return (
    <>
      <section
        data-aos="fade-up"
        data-aos-offset="0"
        data-aos-duration="1000"
        data-aos-delay={0}
        className="bg-green-gradient"
      >
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                {course.tagLine && (
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {course.tagLine}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              {course.shortDescription && (
                <p className="text-xl mb-6">{course.shortDescription}</p>
              )}

              <div className="flex flex-wrap gap-4 mb-6">
                {course.duration && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                    </svg>
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.numberOfStudents && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                    </svg>
                    <span>{course.numberOfStudents}</span>
                  </div>
                )}
                {course.rating && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                    </svg>
                    <span>{course.rating}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Container */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  data-slot="button"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-900 text-white px-8 py-3"
                >
                  পরামর্শের জন্য যোগাযোগ করুন
                </Link>

                {/* Modal Trigger & Buy Box */}
                <CoursePurchaseBox
                  courseId={course.id}
                  courseSlug={course.slug}
                  session={session}
                  hasPurchased={hasPurchased}
                />
              </div>
            </div>

            {/* Schedules Section */}
            <div className="md:col-span-2 bg-gray-100 rounded-lg shadow-xl p-6 text-gray-800 h-fit flex flex-col gap-3">
              {schedules.map((item, index: number) => {
                const schedule = item.schedule;
                const branchName = schedule.branch?.name || item.name;

                return (
                  <div key={index} className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">{branchName}</h2>
                    {schedule.description && (
                      <p className="text-xs text-gray-600">{schedule.description}</p>
                    )}
                    <div className="space-y-1.5 pt-1">
                      {schedule.entries &&
                        schedule.entries.map((entry, dayIndex: number) => (
                          <div key={dayIndex} className="text-xs bg-gray-50 p-2.5 rounded-md border border-gray-100 flex flex-col">
                            <span className="font-semibold text-gray-800 text-sm">{entry.day}</span>
                            <span className="text-gray-600 text-sm">{entry.time} | ক্লাস স্টার্ট: {entry.startingDate}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your page sections (Description, Cards, Instructor, FAQs) remain untouched */}
      {/* ... */}
      <FaqBlock faqs={faqs} title="সচরাচর জিজ্ঞাসা" />
    </>
  );
}