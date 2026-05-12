import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const UserQuizzesPage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      quizAccesses: {
        include: {
          quiz: true,
        },
        orderBy: {
          grantedAt: "desc",
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
        <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quizzes you have access to.
        </p>
      </div>

      {user.quizAccesses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">
            You do not have access to any quiz yet.
          </p>
          <Link
            href="/quizzes"
            className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Browse Quizzes
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {user.quizAccesses.map((access) => (
            <div
              key={access.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {access.quiz.title}
              </h2>

              <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                {access.quiz.description || "No description available."}
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>Duration: {access.quiz.durationMinutes} minutes</p>
                <p>Passing Score: {access.quiz.passingScore}%</p>
                <p>
                  Access Granted:{" "}
                  {new Date(access.grantedAt).toLocaleDateString()}
                </p>
              </div>

              <Link
                href={`/quizzes/${access.quiz.slug}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserQuizzesPage;