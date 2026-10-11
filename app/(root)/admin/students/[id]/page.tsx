import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen, CreditCard, Award, CheckCircle2, Clock } from "lucide-react";

interface StudentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailsPage({ params }: StudentDetailsPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
    redirect("/dashboard");
  }

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      courseAccesses: {
        include: {
          course: {
            include: {
              batches: {
                include: {
                  lessons: {
                    include: {
                      quiz: {
                        include: {
                          attempts: {
                            where: { userId: id },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      lessonProgress: {
        include: {
          lesson: true,
        },
      },
      payments: {
        include: {
          course: true,
          quiz: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) {
    redirect("/admin/students");
  }

  return (
    <section className="min-h-[70vh] bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Students Directory
        </Link>

        {/* Student Profile Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl">
              {student.name?.charAt(0) || student.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{student.name || "Unnamed Student"}</h1>
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                  student.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {student.isActive ? "Active Account" : "Disabled Account"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{student.email}</p>
              <p className="text-xs text-gray-400 mt-1">Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Enrolled Courses & Lesson Quiz Results */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Enrolled Courses & Quiz Results</h2>
          </div>

          {student.courseAccesses.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No course enrollments found for this student.</p>
          ) : (
            <div className="space-y-6">
              {student.courseAccesses.map((access) => {
                const course = access.course;

                return (
                  <div key={access.id} className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-base">{course.title}</h3>
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full">
                        Enrolled via Course Access
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lesson Quiz Breakdown:</h4>
                      
                      {course.batches.flatMap((b) => b.lessons).length === 0 ? (
                        <p className="text-xs text-gray-400">No lessons available in this course.</p>
                      ) : (
                        course.batches.map((batch) =>
                          batch.lessons.map((lesson) => {
                            const quiz = lesson.quiz;
                            const attempt = quiz?.attempts?.[0];

                            return (
                              <div key={lesson.id} className="flex items-center justify-between text-xs bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm">
                                <div className="space-y-1">
                                  <span className="font-semibold text-gray-900 text-sm">{lesson.title}</span>
                                  <p className="text-xs text-gray-500">Quiz: {quiz?.title || "No Quiz Assigned"}</p>
                                </div>

                                {quiz ? (
                                  attempt ? (
                                    <div className="text-right space-y-1">
                                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                        attempt.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                      }`}>
                                        {attempt.passed ? "Passed" : "Failed"} ({attempt.percentage != null ? `${Math.round(attempt.percentage)}%` : "0%"} Score)
                                      </span>
                                      <p className="text-[10px] text-gray-400">
                                        Attempted: {new Date(attempt.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                      <Clock className="h-3 w-3" /> Not Attempted
                                    </span>
                                  )
                                ) : (
                                  <span className="text-xs text-gray-400 italic">No Quiz in Lesson</span>
                                )}
                              </div>
                            );
                          })
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Lesson Progress Records */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Lesson Progress</h2>
          </div>

          {student.lessonProgress.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No lesson progress recorded yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {student.lessonProgress.map((prog) => (
                <div key={prog.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs space-y-2">
                  <p className="font-semibold text-gray-900">{prog.lesson.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold px-2.5 py-1 rounded-full text-[11px] ${
                      prog.isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {prog.isCompleted ? "Completed" : "In Progress"}
                    </span>
                    {prog.completedAt && (
                      <span className="text-gray-400 text-[11px]">
                        {new Date(prog.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Payment History */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Payment & Transaction History</h2>
          </div>

          {student.payments.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No payment transactions found.</p>
          ) : (
            <div className="space-y-3">
              {student.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {payment.course?.title || "Direct Course Purchase"}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(payment.createdAt).toLocaleDateString()} • Provider: <strong className="uppercase">{payment.provider}</strong>
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-extrabold text-gray-900 text-sm">{payment.amount.toString()} {payment.currency}</p>
                    <span className={`font-semibold px-3 py-0.5 rounded-full text-[11px] ${
                      payment.status === "CAPTURED" || payment.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}