import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const UserDashboardPage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      quizAccesses: {
        include: {
          quiz: true,
        },
        orderBy: {
          grantedAt: "desc",
        },
      },
      quizAttempts: {
        include: {
          quiz: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      payments: {
        include: {
          quiz: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalQuizzes = user.quizAccesses.length;
  const totalAttempts = user.quizAttempts.length;
  const passedAttempts = user.quizAttempts.filter(
    (attempt) => attempt.passed === true
  ).length;

  const latestAttempts = user.quizAttempts.slice(0, 5);
  const availableQuizzes = user.quizAccesses.slice(0, 6);

  return (
    <section className="min-h-[50vh]">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name || "Student"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View your quizzes, attempts, results, and payment access.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Available Quizzes" value={totalQuizzes} />
          <DashboardCard title="Total Attempts" value={totalAttempts} />
          <DashboardCard title="Passed Exams" value={passedAttempts} />
          <DashboardCard
            title="Payments"
            value={user.payments.length}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                My Quizzes
              </h2>
              <Link
                href="/quizzes"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Browse quizzes
              </Link>
            </div>

            {availableQuizzes.length === 0 ? (
              <EmptyState message="You do not have access to any quiz yet." />
            ) : (
              <div className="space-y-4">
                {availableQuizzes.map((access) => (
                  <div
                    key={access.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {access.quiz.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {access.quiz.description || "No description available."}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500">
                        Duration: {access.quiz.durationMinutes} mins
                      </span>

                      <Link
                        href={`/quizzes/${access.quiz.slug}`}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
                      >
                        Start Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Results
              </h2>
              <Link
                href="/dashboard/results"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {latestAttempts.length === 0 ? (
              <EmptyState message="You have not taken any quiz yet." />
            ) : (
              <div className="space-y-4">
                {latestAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {attempt.quiz.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Status: {attempt.status}
                        </p>
                      </div>

                      {attempt.percentage !== null && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {attempt.percentage?.toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          attempt.passed
                            ? "text-green-600"
                            : attempt.passed === false
                              ? "text-red-600"
                              : "text-gray-500"
                        }`}
                      >
                        {attempt.passed === true
                          ? "Passed"
                          : attempt.passed === false
                            ? "Failed"
                            : "Pending"}
                      </span>

                      <Link
                        href={`/dashboard/results/${attempt.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserDashboardPage;

const DashboardCard = ({
  title,
  value,
}: {
  title: string;
  value: number;
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};