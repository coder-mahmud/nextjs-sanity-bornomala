// app/payment/success/page.tsx

import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{
    course?: string;
  }>;
}

export default async function SuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="h-20 w-20 text-green-500" />

          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Payment Successful 🎉
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Your course purchase was completed successfully.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            You now have full access to the course.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard/courses"
              className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
            >
              Go to My Courses
            </Link>

            {params.course && (
              <Link
                href={`/dashboard/courses/${params.course}`}
                className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100"
              >
                Start Learning
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}