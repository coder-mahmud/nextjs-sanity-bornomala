import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const UserPaymentsPage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      payments: {
        include: {
          quiz: true,
          course: true,
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

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your payment history.
        </p>
      </div>

      {user.payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">
            No payment history found.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {user.payments.map((payment) => {
                const itemTitle =
                  payment.quiz?.title ||
                  payment.course?.title ||
                  "Unknown item";

                const itemType = payment.course
                  ? "Course"
                  : payment.quiz
                    ? "Quiz"
                    : "Payment";

                return (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {itemTitle}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {itemType}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {payment.amount.toString()} {payment.currency}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {payment.provider}
                    </td>

                    <td className="px-4 py-3">
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

                    <td className="px-4 py-3 text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default UserPaymentsPage;