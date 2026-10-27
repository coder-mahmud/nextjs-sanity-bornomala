import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface QuizDetailsPageProps {
  params: Promise<{
    slug: string;
    lessonSlug: string;
    quizSlug: string;
  }>;
}

export default async function QuizDetailsPage({
  params,
}: QuizDetailsPageProps) {
  const { slug, lessonSlug, quizSlug } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Course & check access
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true },
  });

  if (!course) {
    redirect("/dashboard/courses");
  }

  const access = await prisma.courseAccess.findFirst({
    where: {
      userId: user.id,
      courseId: course.id,
    },
  });

  // If course is not purchased/accessed, redirect to course details page
  if (!access) {
    redirect(`/dashboard/courses/${slug}`);
  }

  // 2. Fetch Lesson & Quiz details
  const lesson = await prisma.lesson.findUnique({
    where: { slug: lessonSlug },
    select: { id: true, slug: true, title: true, startsAt: true, endsAt: true },
  });

  if (!lesson) {
    redirect(`/dashboard/courses/${slug}`);
  }

  const quiz = await prisma.quiz.findUnique({
    where: { slug: quizSlug },
    include: {
      questions: {
        select: { id: true },
      },
    },
  });

  if (!quiz || quiz.status !== "PUBLISHED") {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
              !
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Quiz not found
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The quiz you are looking for does not exist, is unpublished, or is no longer available.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                className="bg-black text-white px-8 py-3 rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
                href={`/dashboard/courses/${slug}/lessons/${lessonSlug}`}
              >
                Back to Lesson
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: user.id,
      quizId: quiz.id,
    },
    select: { 
      id: true, 
      status: true, 
      score: true, 
      totalMarks: true, 
      percentage: true, 
      passed: true 
    },
    orderBy: { createdAt: "desc" },
  });

  // France Time Zone Validation Logic (Europe/Paris)
  const timeZone = "Europe/Paris";
  
  // Convert current server time and database dates into Paris wall-clock equivalent timestamps for accurate comparison
  const nowParisTime = new Date(new Date().toLocaleString("en-US", { timeZone })).getTime();
  const startTime = lesson.startsAt ? new Date(new Date(lesson.startsAt).toLocaleString("en-US", { timeZone })).getTime() : null;
  const endTime = lesson.endsAt ? new Date(new Date(lesson.endsAt).toLocaleString("en-US", { timeZone })).getTime() : null;

  const isBeforeStart = startTime !== null ? nowParisTime < startTime : false;
  const isAfterEnd = endTime !== null ? nowParisTime > endTime : false;

  const startsAt = lesson.startsAt ? new Date(lesson.startsAt) : null;
  const endsAt = lesson.endsAt ? new Date(lesson.endsAt) : null;

  // Helper to format date explicitly in France time zone
  const formatFranceDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      timeZone,
      dateStyle: "medium",
      timeStyle: "short",
    }) + " (France Time)";
  };

  return (
    <main className="bg-slate-50 min-h-screen py-12">
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Breadcrumb */}
          <Link
            href={`/dashboard/courses/${slug}/lessons/${lessonSlug}`}
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            ← Back to {lesson.title}
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-indigo-50 border border-indigo-200 px-4 py-1 text-xs font-semibold text-indigo-700">
                  Lesson Quiz
                </span>
                <span className="inline-flex rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold text-slate-600">
                  {quiz.questions.length} Questions
                </span>
                <span className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700">
                  Access Granted via Course Enrollment
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {quiz.title}
              </h1>

              <p className="text-sm leading-6 text-slate-600">
                {quiz.description || "No description provided for this quiz."}
              </p>

              {(startsAt || endsAt) && (
                <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-indigo-900">
                  <div>
                    <span className="font-semibold">Quiz Window: </span>
                    {startsAt ? formatFranceDate(startsAt) : "Anytime"} {" → "}
                    {endsAt ? formatFranceDate(endsAt) : "No strict deadline"}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3 pt-4">
                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Duration
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {quiz.durationMinutes} mins
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Passing Score
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {quiz.passingScore}%
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Questions
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {quiz.questions.length}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Instructions Before You Begin
                </h2>
                <ul className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  <li className="rounded-xl bg-white p-3.5 border border-slate-200">
                    Ensure you have uninterrupted time for the duration limit.
                  </li>
                  <li className="rounded-xl bg-white p-3.5 border border-slate-200">
                    Review each question carefully before submitting answers.
                  </li>
                  <li className="rounded-xl bg-white p-3.5 border border-slate-200">
                    A minimum score of {quiz.passingScore}% is required to pass.
                  </li>
                  <li className="rounded-xl bg-white p-3.5 border border-slate-200">
                    Total questions to complete: {quiz.questions.length}.
                  </li>
                </ul>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              {existingAttempt && (existingAttempt.status === "SUBMITTED" || existingAttempt.status === "EVALUATED") ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Quiz Result</h2>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      existingAttempt.passed 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {existingAttempt.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You have already completed this quiz. Here is a summary of your performance.
                  </p>

                  <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Score</span>
                      <span className="font-semibold text-slate-800">
                        {existingAttempt.score ?? 0} / {existingAttempt.totalMarks ?? quiz.questions.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Percentage</span>
                      <span className="font-semibold text-slate-800">
                        {existingAttempt.percentage != null ? `${Math.round(existingAttempt.percentage)}%` : "0%"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Passing Score</span>
                      <span className="font-semibold text-slate-800">{quiz.passingScore}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/result/${existingAttempt.id}`}
                      className="w-full text-center bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                    >
                      View Detailed Result
                    </Link>

                    {/* NEW: Retake / Restart Quiz Link */}
                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/start`}
                      className="w-full text-center bg-black text-white px-6 py-3 rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
                    >
                      Retake Quiz
                    </Link>

                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}`}
                      className="w-full text-center border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Back to Lesson
                    </Link>
                  </div>
                </>
              ) : existingAttempt && existingAttempt.status === "STARTED" ? (
                <>
                  <h2 className="text-xl font-bold text-slate-900">Quiz in Progress</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You have an active attempt currently ongoing for this quiz.
                  </p>

                  <div className="space-y-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-800">
                    <p className="font-medium">An attempt is currently active. Click below to continue or check your status.</p>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/start`}
                      className="w-full text-center bg-amber-600 text-white px-6 py-3 rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
                    >
                      Continue Quiz
                    </Link>

                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}`}
                      className="w-full text-center border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Back to Lesson
                    </Link>
                  </div>
                </>
              ) : isBeforeStart ? (
                <>
                  <h2 className="text-xl font-bold text-slate-900">Quiz Not Started Yet</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This quiz is scheduled to start at a later time. Please check back when it opens.
                  </p>

                  <div className="space-y-2 rounded-2xl bg-blue-50 p-4 border border-blue-200 text-xs text-blue-900">
                    <span className="font-semibold block">Starts At:</span>
                    <span>{startsAt ? formatFranceDate(startsAt) : ""}</span>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      disabled
                      className="w-full text-center bg-slate-200 text-slate-400 px-6 py-3 rounded-xl text-xs font-semibold cursor-not-allowed"
                    >
                      Quiz Locked
                    </button>

                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}`}
                      className="w-full text-center border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Back to Lesson
                    </Link>
                  </div>
                </>
              ) : isAfterEnd ? (
                <>
                  <h2 className="text-xl font-bold text-slate-900">Quiz Closed</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The submission time window for this quiz has ended. New attempts are no longer permitted.
                  </p>

                  <div className="space-y-2 rounded-2xl bg-red-50 p-4 border border-red-200 text-xs text-red-900">
                    <span className="font-semibold block">Ended At:</span>
                    <span>{endsAt ? formatFranceDate(endsAt) : ""}</span>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      disabled
                      className="w-full text-center bg-slate-200 text-slate-400 px-6 py-3 rounded-xl text-xs font-semibold cursor-not-allowed"
                    >
                      Quiz Expired
                    </button>

                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}`}
                      className="w-full text-center border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Back to Lesson
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900">Ready to start?</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You are enrolled in this course and have full access to complete this quiz.
                  </p>

                  <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-semibold text-slate-800">{quiz.durationMinutes} mins</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Passing Score</span>
                      <span className="font-semibold text-slate-800">{quiz.passingScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Questions</span>
                      <span className="font-semibold text-slate-800">{quiz.questions.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/start`}
                      className="w-full text-center bg-black text-white px-6 py-3 rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
                    >
                      Start Quiz
                    </Link>

                    <Link
                      href={`/dashboard/courses/${slug}/lessons/${lessonSlug}`}
                      className="w-full text-center border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Back to Lesson
                    </Link>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}