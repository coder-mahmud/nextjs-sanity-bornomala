import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const AdminDashboardPage = async () => {
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const [
    totalUsers,
    totalAdmins,
    totalQuizzes,
    publishedQuizzes,
    draftQuizzes,
    totalAttempts,
    passedAttempts,
    totalPayments,
    capturedPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: {
          in: ["ADMIN", "SUPERADMIN"],
        },
      },
    }),
    prisma.quiz.count(),
    prisma.quiz.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.quiz.count({
      where: {
        status: "DRAFT",
      },
    }),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.count({
      where: {
        passed: true,
      },
    }),
    prisma.payment.count(),
    prisma.payment.findMany({
      where: {
        status: "CAPTURED",
      },
      select: {
        amount: true,
      },
    }),
  ]);

  const totalRevenue = capturedPayments.reduce((acc, payment) => {
    return acc + Number(payment.amount);
  }, 0);

  const recentAttempts = await prisma.quizAttempt.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      quiz: true,
    },
  });

  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      quiz: true,
    },
  });

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of users, quizzes, attempts, and payments.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Users" value={totalUsers.toString()} />
        <StatsCard title="Admins" value={totalAdmins.toString()} />
        <StatsCard title="Total Quizzes" value={totalQuizzes.toString()} />
        <StatsCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Published Quizzes" value={publishedQuizzes.toString()} />
        <StatsCard title="Draft Quizzes" value={draftQuizzes.toString()} />
        <StatsCard title="Total Attempts" value={totalAttempts.toString()} />
        <StatsCard title="Passed Attempts" value={passedAttempts.toString()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Attempts
          </h2>

          {recentAttempts.length === 0 ? (
            <EmptyState message="No quiz attempts found." />
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
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
                        {attempt.user.name || "No name"} — {attempt.user.email}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        attempt.passed
                          ? "bg-green-100 text-green-700"
                          : attempt.passed === false
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {attempt.passed === true
                        ? "Passed"
                        : attempt.passed === false
                          ? "Failed"
                          : attempt.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>
                      Score: {attempt.score ?? "-"} / {attempt.totalMarks ?? "-"}
                    </span>
                    <span>
                      Percentage:{" "}
                      {attempt.percentage !== null
                        ? `${attempt.percentage?.toFixed(0)}%`
                        : "-"}
                    </span>
                    <span>
                      Date: {new Date(attempt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Payments
          </h2>

          {recentPayments.length === 0 ? (
            <EmptyState message="No payments found." />
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {payment.quiz!.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {payment.user.name || "No name"} — {payment.user.email}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        payment.status === "CAPTURED"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : payment.status === "REFUNDED"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>
                      Amount: {payment.amount.toString()} {payment.currency}
                    </span>
                    <span>Provider: {payment.provider}</span>
                    <span>
                      Date: {new Date(payment.createdAt).toLocaleDateString()}
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
};

export default AdminDashboardPage;

const StatsCard = ({
  title,
  value,
}: {
  title: string;
  value: string;
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