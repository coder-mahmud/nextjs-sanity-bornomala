import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const UserResultsPage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      quizAttempts: {
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

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your quiz attempts and scores.
        </p>
      </div>

      {user.quizAttempts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">
            You have not taken any quiz yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Quiz</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Percentage</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {user.quizAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {attempt.quiz.title}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {attempt.score ?? "-"} / {attempt.totalMarks ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {attempt.percentage !== null
                      ? `${attempt.percentage?.toFixed(0)}%`
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
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
                          : "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/results/${attempt.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default UserResultsPage;