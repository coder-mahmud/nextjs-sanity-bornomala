// app/payment/cancel/page.tsx

import Link from "next/link";
import { XCircle } from "lucide-react";

interface CancelPageProps {
  searchParams: Promise<{
    course?: string;
    quiz?: string;
  }>;
}

export default async function CancelPage({
  searchParams,
}: CancelPageProps) {
  const params = await searchParams;

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <XCircle className="h-20 w-20 text-red-500" />

          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Payment Cancelled
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Your payment was not completed.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            No worries — you can try again anytime.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {params.course && (
              <>
                <Link
                  href={`/video-courses/${params.course}`}
                  className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
                >
                  Try Again
                </Link>

                <Link
                  href="/video-courses"
                  className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100"
                >
                  Browse Courses
                </Link>
              </>
            )}

            {params.quiz && (
              <>
                <Link
                  href={`/quizzes/${params.quiz}`}
                  className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
                >
                  Try Again
                </Link>

                <Link
                  href="/quizzes"
                  className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100"
                >
                  Browse Quizzes
                </Link>
              </>
            )}

            {!params.course && !params.quiz && (
              <Link
                href="/"
                className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
              >
                Go Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}