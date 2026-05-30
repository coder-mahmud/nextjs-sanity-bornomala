// app/payment/success/page.tsx

import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{
    course?: string;
    quiz?: string;
  }>;
}

export default async function SuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;

  const isQuizPurchase = Boolean(params.quiz);
  const isCoursePurchase = Boolean(params.course);

  const purchaseType = isQuizPurchase
    ? "quiz"
    : isCoursePurchase
      ? "course"
      : "purchase";

  const slug = params.quiz || params.course;

  const accessMessage = isQuizPurchase
    ? "You now have full access to the quiz."
    : isCoursePurchase
      ? "You now have full access to the course."
      : "Your access has been added to your account.";

  const actionLabel = isQuizPurchase
    ? "Start Quiz"
    : isCoursePurchase
      ? "Start Learning"
      : "Go to Dashboard";

  const actionHref = isQuizPurchase
    ? `/quizzes/${slug}/start`
    : isCoursePurchase
      ? `/dashboard/courses/${slug}`
      : "/dashboard";

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="h-20 w-20 text-green-500" />

          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Payment Successful 🎉
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Your {purchaseType} purchase was completed successfully.
          </p>

          <p className="mt-2 text-sm text-gray-500">{accessMessage}</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
            >
              Go to My Dashboard
            </Link>

            {slug && (
              <Link
                href={actionHref}
                className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100"
              >
                {actionLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}