// app/(root)/courses/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import FaqBlock from "@/components/shared/FaqBlock";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

type FAQ = {
  question: string;
  answer: string;
};

// 1. Define the exact include query object ordered by createdAt
const courseInclude = {
  instructor: true,
  cards: {
    orderBy: {
      order: "asc",
    },
  },
  parisSchedule: {
    include: {
      branch: true,
      entries: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  },
  hocheSchedule: {
    include: {
      branch: true,
      entries: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  },
} satisfies Prisma.CourseInclude;

// 2. Infer the exact course payload type with included relations
export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: typeof courseInclude;
}>;

// 3. Fetch course with strictly defined return type
async function getCourse(slug: string): Promise<CourseWithRelations | null> {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: courseInclude,
  });

  return course as CourseWithRelations | null;
}

export async function generateStaticParams() {
  const courses = await prisma.course.findMany({
    select: {
      slug: true,
    },
  });

  return courses.map((course: { slug: string }) => ({
    slug: course.slug,
  }));
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

  // Safely parse FAQs stored as JSON in Prisma
  const faqs = (course.faqs as unknown as FAQ[]) || [];

  // Structure schedules safely with explicit type predicate
  const schedules = [
    { name: "Paris", schedule: course.parisSchedule },
    { name: "Hoche", schedule: course.hocheSchedule },
  ].filter(
    (
      s
    ): s is {
      name: string;
      schedule: NonNullable<typeof s.schedule>;
    } => s.schedule !== null
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
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                    </svg>
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.numberOfStudents && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                    </svg>
                    <span>{course.numberOfStudents}</span>
                  </div>
                )}
                {course.rating && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                    </svg>
                    <span>{course.rating}</span>
                  </div>
                )}
              </div>

              <div>
                <Link
                  href="/contact"
                  data-slot="button"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-900 text-white px-8 py-3"
                >
                  পরামর্শের জন্য যোগাযোগ করুন
                </Link>
              </div>
            </div>

            {/* Schedules Section */}
            <div className="md:col-span-2 bg-gray-100 rounded-lg shadow-xl p-6 text-gray-800 h-fit flex flex-col gap-3">
              {schedules.map((item, index: number) => {
                const schedule = item.schedule;
                const branchName = schedule.branch?.name || item.name;

                return (
                  <div key={index} className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {branchName}
                    </h2>
                    {schedule.description && (
                      <p className="text-xs text-gray-600">{schedule.description}</p>
                    )}

                    <div className="space-y-1.5 pt-1">
                      {schedule.entries &&
                        schedule.entries.map((entry, dayIndex: number) => (
                          <div key={dayIndex} className="text-xs bg-gray-50 p-2.5 rounded-md border border-gray-100 flex flex-col ">
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

      <section
        data-aos="fade-up"
        data-aos-offset="100"
        data-aos-duration="1000"
        data-aos-delay={0}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              কোর্স সম্পর্কে
            </h2>

            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div
                className="text-gray-700 leading-relaxed mb-6"
                dangerouslySetInnerHTML={{
                  __html: course.description ?? "",
                }}
              />

              <div className="grid md:grid-cols-2 gap-6">
                {course.characteristics.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      কোর্সের বৈশিষ্ট্য
                    </h3>
                    <ul className="content_list list-disc pl-5 space-y-1 text-gray-700">
                      {course.characteristics.map(
                        (item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {course.targetAudience.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      কোর্সটি কাদের জন্যে?
                    </h3>
                    <ul className="content_list list-disc pl-5 space-y-1 text-gray-700">
                      {course.targetAudience.map(
                        (item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {course.cards && course.cards.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div
              data-aos="fade-up"
              data-aos-offset="0"
              data-aos-duration="1000"
              data-aos-delay={0}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                কোর্সের উদ্দেশ্য ও সুবিধা
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {course.cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-indigo-500"
                >
                  {card.image && (
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <Image
                        src={card.image}
                        alt={card.title}
                        width={32}
                        height={32}
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  {card.description && (
                    <p className="text-gray-600 text-sm">{card.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {instructor && (
        <section
          data-aos="fade-up"
          data-aos-offset="0"
          data-aos-duration="1000"
          data-aos-delay={0}
          className="py-16"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                আপনার প্রশিক্ষক
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                অভিজ্ঞ ও পেশাদার শিক্ষক
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="md:flex">
                {instructor.imageUrl && (
                  <div className="md:w-1/3 relative min-h-[250px]">
                    <Image
                      alt={instructor.name}
                      src={instructor.imageUrl}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="md:w-2/3 p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {instructor.name}
                  </h3>
                  {instructor.designation && (
                    <p className="text-indigo-600 font-semibold mb-4">
                      {instructor.designation}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">অভিজ্ঞতা</p>
                      <p className="font-semibold">
                        {instructor.experience || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">শিক্ষার্থী</p>
                      <p className="font-semibold">
                        {instructor.studentCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">রেটিং</p>
                      <p className="font-semibold">
                        {instructor.rating
                          ? instructor.rating.toString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">কোর্স</p>
                      <p className="font-semibold">
                        {instructor.courseCount}
                      </p>
                    </div>
                  </div>

                  {instructor.description && (
                    <div
                      className="text-gray-700 mb-4"
                      dangerouslySetInnerHTML={{
                        __html: instructor.description,
                      }}
                    />
                  )}

                  <div className="flex flex-wrap gap-2 mb-6">
                    {instructor.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <FaqBlock faqs={faqs} title="সচরাচর জিজ্ঞাসা" />
    </>
  );
}