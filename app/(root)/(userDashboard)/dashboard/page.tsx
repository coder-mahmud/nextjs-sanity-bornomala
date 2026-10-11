import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

type UserWithDashboardData = Prisma.UserGetPayload<{
  include: {
    courseAccesses: {
      include: {
        course: true;
      };
    };
    payments: {
      include: {
        course: true;
      };
    };
  };
}>;

const UserDashboardPage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = (await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      courseAccesses: {
        include: {
          course: true,
        },
        orderBy: {
          grantedAt: "desc",
        },
      },
      payments: {
        include: {
          course: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })) as UserWithDashboardData | null;

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  
  // Filter active/non-expired course accesses
  const activeCourseAccesses = user.courseAccesses.filter(
    (access) => !access.expiresAt || new Date(access.expiresAt) > now
  );

  const totalCourses = activeCourseAccesses.length;
  const totalPayments = user.payments.length;
  const completedPayments = user.payments.filter((p) => p.status === "CAPTURED" || p.status === "APPROVED").length;

  const enrolledCourses = activeCourseAccesses.slice(0, 6);
  const recentPayments = user.payments.slice(0, 5);

  return (
    <section className="min-h-[50vh] bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {user.name || "Student"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your enrolled courses, active learning access, and transaction history.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard title="Enrolled Courses" value={totalCourses} />
          <DashboardCard title="Total Transactions" value={totalPayments} />
          <DashboardCard title="Successful Payments" value={completedPayments} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Enrolled Courses Section */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                My Courses
              </h2>
              <Link
                href="/dashboard/courses"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all courses →
              </Link>
            </div>

            {enrolledCourses.length === 0 ? (
              <EmptyState message="You do not have access to any courses yet." actionUrl="/courses" actionText="Browse Courses" />
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((access) => (
                  <div
                    key={access.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {access.course.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {access.course.shortDescription || access.course.description || "No description available."}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        Access Active
                      </span>

                      <Link
                        href={`/dashboard/courses/${access.course.slug}`}
                        className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
                      >
                        Go to Course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment & Transaction History Section */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Payments
              </h2>
              <span className="text-xs font-medium text-gray-400">
                Latest transactions
              </span>
            </div>

            {recentPayments.length === 0 ? (
              <EmptyState message="No payment records found." />
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {payment.course?.title || "Course Enrollment"}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-400 uppercase tracking-wide">
                          ID: {payment.id}
                        </p>
                      </div>

                      <span className="text-sm font-bold text-gray-900">
                        {payment.amount.toString()} {payment.currency}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className={`font-semibold px-2.5 py-1 rounded-full ${
                        payment.status === "CAPTURED" || payment.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : payment.status === "CREATED"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {payment.status}
                      </span>

                      <span className="text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
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
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <h3 className="mt-2 text-3xl font-extrabold text-gray-900">{value}</h3>
    </div>
  );
};

const EmptyState = ({ message, actionUrl, actionText }: { message: string; actionUrl?: string; actionText?: string }) => {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
      <p className="text-xs text-gray-500">{message}</p>
      {actionUrl && actionText && (
        <Link
          href={actionUrl}
          className="mt-4 inline-block rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};