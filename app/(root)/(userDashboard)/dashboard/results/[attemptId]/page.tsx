import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const ResultDetailsPage = async ({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) => {
  const { attemptId } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      id: attemptId,
      user: {
        email: session.user.email,
      },
    },
    include: {
      quiz: true,
      answers: {
        include: {
          question: true,
          selectedOption: true,
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {attempt.quiz.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Result details</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResultCard title="Score" value={`${attempt.score ?? "-"} / ${attempt.totalMarks ?? "-"}`} />
        <ResultCard title="Percentage" value={attempt.percentage !== null ? `${attempt.percentage?.toFixed(0)}%` : "-"} />
        <ResultCard title="Status" value={attempt.status} />
        <ResultCard
          title="Result"
          value={
            attempt.passed === true
              ? "Passed"
              : attempt.passed === false
                ? "Failed"
                : "Pending"
          }
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Answers
        </h2>

        <div className="space-y-4">
          {attempt.answers.map((answer, index) => (
            <div
              key={answer.id}
              className="rounded-xl border border-gray-100 p-4"
            >
              <p className="font-medium text-gray-900">
                {index + 1}. {answer.question.text}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Your Answer:{" "}
                <span className="font-medium">
                  {answer.selectedOption?.text || "Not answered"}
                </span>
              </p>

              <p
                className={`mt-2 text-sm font-medium ${
                  answer.isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {answer.isCorrect ? "Correct" : "Incorrect"}
              </p>

              {answer.question.explanation && (
                <p className="mt-2 text-sm text-gray-500">
                  Explanation: {answer.question.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultDetailsPage;

const ResultCard = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="mt-2 text-xl font-bold text-gray-900">{value}</h3>
    </div>
  );
};