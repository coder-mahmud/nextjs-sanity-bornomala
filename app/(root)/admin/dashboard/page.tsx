import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: {
    user: true;
    course: true;
  };
}>;

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
    totalStudents,
    totalAdmins,
    totalCourses,
    publishedCourses,
    draftCourses,
    totalCourseAccesses,
    totalPayments,
    capturedPayments,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
      },
    }),
    prisma.user.count({
      where: {
        role: {
          in: ["ADMIN", "SUPERADMIN"],
        },
      },
    }),
    prisma.course.count(),
    prisma.course.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.course.count({
      where: {
        status: "DRAFT",
      },
    }),
    prisma.courseAccess.count(),
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

  const recentPayments = (await prisma.payment.findMany({
    take: 6,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      course: true,
    },
  })) as unknown as PaymentWithRelations[];

  return (
    <section className="min-h-[70vh] bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive platform overview of students, course statistics, enrollments, and revenue.
          </p>
        </div>

        {/* Primary Metrics Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Total Students" value={totalStudents.toString()} />
          <StatsCard title="Admin Staff" value={totalAdmins.toString()} />
          <StatsCard title="Total Courses" value={totalCourses.toString()} />
          <StatsCard title="Active Enrollments" value={totalCourseAccesses.toString()} />
        </div>

        {/* Secondary Metrics Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Published Courses" value={publishedCourses.toString()} />
          <StatsCard title="Draft Courses" value={draftCourses.toString()} />
          <StatsCard title="Total Transactions" value={totalPayments.toString()} />
          <StatsCard title="Total Revenue" value={`€${totalRevenue.toFixed(2)}`} />
        </div>

        {/* Detailed Feed Section */}
        <div className="grid gap-6 xl:grid-cols-1">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Payment Transactions
              </h2>
              <span className="text-xs font-medium text-gray-400">
                Latest course purchases
              </span>
            </div>

            {recentPayments.length === 0 ? (
              <EmptyState message="No transactions recorded yet." />
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => {
                  const courseTitle = payment.course?.title || "Direct Course Purchase";

                  return (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {courseTitle}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Student: <span className="font-medium text-gray-700">{payment.user.name || "Unnamed"}</span> ({payment.user.email})
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-gray-900">
                            {payment.amount.toString()} {payment.currency}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              payment.status === "CAPTURED" || payment.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : payment.status === "FAILED"
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : payment.status === "REFUNDED"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-200/60">
                        <span>Provider: <strong className="text-gray-600 uppercase">{payment.provider}</strong></span>
                        <span>Transaction Date: <strong className="text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</strong></span>
                        <span className="font-mono text-[11px] text-gray-400">ID: {payment.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <h3 className="mt-2 text-3xl font-extrabold text-gray-900">{value}</h3>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
};