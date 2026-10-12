import { auth } from '@/auth';
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Trophy, XCircle, CheckCircle2, FileText } from "lucide-react";

async function getResult(attemptId: string, userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/attempts/${attemptId}/result`, {
    cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error("Failed to load result");
  return data;
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
  searchParams: Promise<{ lessonsSlug?: string }>;
}) {
  const { slug, attemptId } = await params;
  const { lessonsSlug } = await searchParams;

  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  const userId = dbUser.id;
  const result = await getResult(attemptId, userId);

  // const backUrl = lessonsSlug
  //   ? `/dashboard/courses/${slug}/lessons/${lessonsSlug}`
  //   : `/dashboard/courses/${slug}/lessons/`;
  const backUrl = `/dashboard/courses/${slug}/`

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-8">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lesson
        </Link>

        {/* Hero Result Banner */}
        <div className={`rounded-3xl border p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${
          result.passed 
            ? "border-emerald-200 bg-emerald-50/40 text-emerald-950" 
            : "border-red-200 bg-red-50/40 text-red-950"
        }`}>
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              result.passed ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}>
              {result.passed ? <Trophy className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
            </div>

            <div className="space-y-1">
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                result.passed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}>
                {result.passed ? "Quiz Passed Successfully" : "Quiz Failed"}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {result.passed ? "Great Job!" : "Keep Practicing!"}
              </h1>
              <p className="text-xs text-gray-600">
                Here is a comprehensive summary of your performance for this attempt.
              </p>
            </div>
          </div>

          <div className="flex gap-4 bg-white px-6 py-4 rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="text-center">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Score</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {result.score} <span className="text-xs text-gray-400 font-normal">/ {result.totalMarks}</span>
              </p>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Percentage</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {result.percentage != null ? `${Math.round(result.percentage)}%` : "0%"}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Question Review Breakdown */}
        {/* <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Question Answer Review</h2>
          </div>

          {result.answers && result.answers.length > 0 ? (
            <div className="space-y-4">
              {result.answers.map((ans: any, idx: number) => (
                <div 
                  key={ans.id || idx} 
                  className={`rounded-2xl border p-5 space-y-3 ${
                    ans.isCorrect ? "border-emerald-200 bg-emerald-50/20" : "border-red-200 bg-red-50/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-400">Question {idx + 1}</span>
                      <h3 className="font-semibold text-gray-900 text-sm">{ans.question?.text}</h3>
                    </div>

                    <span className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      ans.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {ans.isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {ans.isCorrect ? `+${ans.awardedMarks ?? 1} Marks` : "0 Marks"}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 pt-2 border-t border-gray-200/60">
                    <p className="text-gray-500">
                      Your Answer: <strong className={ans.isCorrect ? "text-emerald-700" : "text-red-600"}>
                        {ans.selectedOption?.text || "No option selected"}
                      </strong>
                    </p>
                    {ans.question?.explanation && (
                      <p className="text-gray-600 italic bg-white p-3 rounded-xl border border-gray-200 mt-2">
                        💡 Explanation: {ans.question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Detailed question analysis is unavailable for this attempt.</p>
          )}
        </div> */}

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Question Answer Review</h2>
          </div>

          {result.answers && result.answers.length > 0 ? (
            <div className="space-y-4">
              {result.answers.map((ans: any, idx: number) => {
                // Find the correct option for this question from the options array
                const correctOption = ans.question?.options?.find((opt: any) => opt.isCorrect);

                return (
                  <div 
                    key={ans.id || idx} 
                    className={`rounded-2xl border p-5 space-y-3 ${
                      ans.isCorrect ? "border-emerald-200 bg-emerald-50/20" : "border-red-200 bg-red-50/20"
                    }`}
                  >
                    {/* Question Header & Status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400">Question {idx + 1}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{ans.question?.text}</h3>
                      </div>

                      <span className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        ans.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>
                        {ans.isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {ans.isCorrect ? `+${ans.awardedMarks ?? 1} Marks` : "0 Marks"}
                      </span>
                    </div>

                    {/* Student's Answer vs Correct Answer Details */}
                    <div className="text-xs space-y-2 pt-2 border-t border-gray-200/60">
                      <p className="text-gray-500">
                        Your Answer:{" "}
                        <strong className={ans.isCorrect ? "text-emerald-700 font-bold" : "text-red-600 font-bold"}>
                          {ans.selectedOption?.text || "No option selected"}
                        </strong>
                      </p>

                      {!ans.isCorrect && correctOption && (
                        <p className="text-gray-500">
                          Correct Answer:{" "}
                          <strong className="text-emerald-700 font-bold">
                            {correctOption.text}
                          </strong>
                        </p>
                      )}

                      {ans.question?.explanation && (
                        <p className="text-gray-600 italic bg-white p-3 rounded-xl border border-gray-200 mt-2">
                          💡 Explanation: {ans.question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Detailed question analysis is unavailable for this attempt.</p>
          )}
        </div>




        {/* Footer Actions */}
        <div className="flex justify-center pt-2">
          <Link
            href={backUrl}
            className="rounded-2xl bg-black px-8 py-3.5 text-xs font-semibold text-white hover:bg-gray-800 transition shadow-sm"
          >
            Return to Course
          </Link>
        </div>
      </div>
    </main>
  );
}