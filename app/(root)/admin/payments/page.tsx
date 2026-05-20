import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const AdminPaymentsPage = async () => {
  const session = await auth();

  // SUPERADMIN ONLY
  if (!session || session.user?.role !== "SUPERADMIN") {
    redirect("/admin/dashboard");
  }

  const payments = await prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      quiz: true,
    },
  });

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
    <section>
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
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Quiz</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                Paypal Order ID
              </th>
              <th className="px-4 py-3 font-medium">
                Capture ID
              </th>
              <th className="px-4 py-3 font-medium">Paid At</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.user.name || "No name"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {payment.user.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4 font-medium text-gray-900">
                    {payment.quiz?.title}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {payment.amount.toString()}{" "}
                    {payment.currency}
                  </td>

                  <td className="px-4 py-4 text-gray-600 uppercase">
                    {payment.provider}
                  </td>

                  <td className="px-4 py-4">
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
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {payment.paypalOrderId || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {payment.paypalCaptureId || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {payment.paidAt
                      ? new Date(
                          payment.paidAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {new Date(
                      payment.createdAt
                    ).toLocaleDateString()}
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