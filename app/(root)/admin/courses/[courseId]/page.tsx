import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  ArrowLeft, 
  Edit3, 
  BookOpen, 
  Layers, 
  Users, 
  CreditCard,
  Clock,
  Star,
  UserCheck,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface CourseDetailsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: true,
      faqs: { orderBy: { order: "asc" } },
      cards: { orderBy: { order: "asc" } },
      batches: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { lessons: true, accesses: true } },
        },
      },
      _count: {
        select: {
          batches: true,
          accesses: true,
          payments: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const courseImage = course.thumbnail;

  return (
    <section className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  course.status === "PUBLISHED"
                    ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                    : course.status === "ARCHIVED"
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                    : "bg-gray-100 text-gray-700 ring-1 ring-gray-500/10"
                }`}
              >
                {course.status}
              </span>
            </div>
            {course.tagLine && (
              <p className="text-sm font-medium text-blue-600 mt-0.5">{course.tagLine}</p>
            )}
            <p className="text-xs text-gray-500 font-mono mt-0.5">/{course.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/courses/${course.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 transition"
          >
            <Edit3 className="w-4 h-4" />
            Edit Course
          </Link>
          <Link
            href={`/admin/courses/${course.id}/content`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <BookOpen className="w-4 h-4" />
            Manage Content
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Batches</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{course._count.batches}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Enrolled Students</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{course._count.accesses}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{course._count.payments}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Course Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Course Overview</h2>
            
            {course.shortDescription && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Short Summary</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{course.shortDescription}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Detailed Description</p>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">
                {course.description || "No description provided for this course."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {course.price.toString()} {course.currency || "EUR"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {course.level || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {course.duration || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {course.rating || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Characteristics & Target Audience */}
          {(course.characteristics.length > 0 || course.targetAudience.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {course.characteristics.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Course Features</h3>
                  <ul className="space-y-2">
                    {course.characteristics.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.targetAudience.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Target Audience</h3>
                  <ul className="space-y-2">
                    {course.targetAudience.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                        <UserCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Batches */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">Batches ({course.batches.length})</h2>
            </div>

            {course.batches.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No batches created for this course yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {course.batches.map((batch) => (
                  <div key={batch.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{batch.title}</p>
                      <p className="text-xs text-gray-500 font-mono">/{batch.slug}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{batch._count.lessons} lessons</span>
                      <span>{batch._count.accesses} students</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs */}
          {course.faqs.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Frequently Asked Questions ({course.faqs.length})
              </h3>
              <div className="space-y-3 divide-y divide-gray-100">
                {course.faqs.map((faq) => (
                  <div key={faq.id} className="pt-2">
                    <p className="text-xs font-bold text-gray-800">Q: {faq.question}</p>
                    <p className="text-xs text-gray-600 mt-1">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Course Thumbnail</h3>
            {courseImage ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <Image
                  src={courseImage}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                No Thumbnail Uploaded
              </div>
            )}
          </div>

          {/* Instructor Info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Instructor</h3>
            {course.instructor ? (
              <div className="flex items-center gap-3">
                {course.instructor.imageUrl ? (
                  <Image
                    src={course.instructor.imageUrl}
                    alt={course.instructor.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                    {course.instructor.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-900">{course.instructor.name}</p>
                  <p className="text-xs text-gray-500">{course.instructor.title || course.instructor.designation || "Instructor"}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No instructor assigned.</p>
            )}
          </div>

          {/* Additional Metadata */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Course Details</h3>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Position:</span>
                <span className="font-mono">{course.order ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Displayed Students:</span>
                <span className="font-mono">{course.numberOfStudents ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="font-mono">{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Updated:</span>
                <span className="font-mono">{new Date(course.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}