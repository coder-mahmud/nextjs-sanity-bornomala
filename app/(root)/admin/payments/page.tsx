import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import Link from "next/link";
import { Eye } from "lucide-react";

type AdminPaymentWithRelations = Prisma.PaymentGetPayload<{
  include: {
    user: true;
    quiz: true;
  };
}>;

const AdminPaymentsPage = async () => {
  const session = await auth();

  // SUPERADMIN ONLY
  if (!session || session.user?.role !== "SUPERADMIN") {
    redirect("/admin/dashboard");
  }

  const payments = (await prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      quiz: true,
    },
  })) as unknown as AdminPaymentWithRelations[];

  const totalRevenue = payments.reduce((acc, payment) => {
    return payment.status === "CAPTURED"
      ? acc + Number(payment.amount)
      : acc;
  }, 0);

  const successfulPayments = payments.filter(
    (payment) => payment.status === "CAPTURED"
  ).length;

  const pendingPayments = payments.filter(
    (payment) =>
      payment.status === "CREATED" ||
      payment.status === "APPROVED"
  ).length;

  const refundedPayments = payments.filter(
    (payment) => payment.status === "REFUNDED"
  ).length;

  return (
    <section className="w-full max-w-full overflow-hidden">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Payments
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor all quiz payments and transactions.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
        />

        <StatsCard
          title="Successful Payments"
          value={successfulPayments.toString()}
        />

        <StatsCard
          title="Pending Payments"
          value={pendingPayments.toString()}
        />

        <StatsCard
          title="Refunded Payments"
          value={refundedPayments.toString()}
        />
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
            <tr>
              <th className="px-3 py-3 font-medium">User</th>
              <th className="px-3 py-3 font-medium">Quiz</th>
              <th className="px-3 py-3 font-medium">Amount</th>
              <th className="px-3 py-3 font-medium">Provider</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">PayPal ID</th>
              <th className="px-3 py-3 font-medium">Capture ID</th>
              <th className="px-3 py-3 font-medium">Paid At</th>
              <th className="px-3 py-3 font-medium">Created</th>
              <th className="px-3 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-4 max-w-[200px] truncate">
                    <div>
                      <p className="font-medium text-gray-900 truncate">
                        {payment.user.name || "No name"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {payment.user.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-3 py-4 font-medium text-gray-900 max-w-[150px] truncate">
                    {payment.quiz?.title || "-"}
                  </td>

                  <td className="px-3 py-4 text-gray-600 whitespace-nowrap">
                    {payment.amount.toString()}{" "}
                    {payment.currency}
                  </td>

                  <td className="px-3 py-4 text-gray-600 uppercase text-xs">
                    {payment.provider}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                  </td>

                  <td className="px-3 py-4 text-gray-500 text-xs font-mono max-w-[100px] truncate">
                    {payment.paypalOrderId || "-"}
                  </td>

                  <td className="px-3 py-4 text-gray-500 text-xs font-mono max-w-[100px] truncate">
                    {payment.paypalCaptureId || "-"}
                  </td>

                  <td className="px-3 py-4 text-gray-600 text-xs whitespace-nowrap">
                    {payment.paidAt
                      ? new Date(
                          payment.paidAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-3 py-4 text-gray-600 text-xs whitespace-nowrap">
                    {new Date(
                      payment.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-3 py-4 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/students/${payment.userId}`}
                      title="View Student Details"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminPaymentsPage;

const StatsCard = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </h3>
    </div>
  );
};