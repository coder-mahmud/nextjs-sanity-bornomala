import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userHasQuizAccess } from "@/lib/quiz-access";
import BuyQuizButton from "@/components/quiz/BuyQuizButton";

export default async function QuizDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: {
      questions: {
        select: { id: true },
      },
    },
  });

  if (!quiz || quiz.status !== "PUBLISHED") {
    return (
      <main className="min-h-[70vh] bg-linear-to-b from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
              !
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Quiz not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              The quiz you are looking for does not exist, is unpublished, or is
              no longer available.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                href="/quizzes"
              >
                See All Quizzes
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  let hasAccess = false;

  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (dbUser) {
      hasAccess = await userHasQuizAccess(dbUser.id, quiz.id);
    }
  }

  return (
    <main className="bg-linear-to-b from-slate-50 via-white to-slate-100">
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  Published Quiz
                </span>

                <span className="inline-flex rounded-full bg-slate-100 px-4 py-1 text-sm font-medium text-slate-600">
                  {quiz.questions.length} Questions
                </span>

                {hasAccess && (
                  <span className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700">
                    Access Granted
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {quiz.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                {quiz.description || "No description provided for this quiz."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Duration
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {quiz.durationMinutes} min
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Passing Score
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {quiz.passingScore}%
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Questions
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {quiz.questions.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Price
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {quiz.price.toString()} {quiz.currency}
                  </p>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Before you begin
                </h2>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    Make sure you have enough uninterrupted time to complete the
                    quiz.
                  </div>

                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    Read each question carefully before selecting your answer.
                  </div>

                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    You need at least {quiz.passingScore}% to pass successfully.
                  </div>

                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    The full quiz contains {quiz.questions.length} questions.
                  </div>
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                {hasAccess ? "Ready to start?" : "Unlock this quiz"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {hasAccess
                  ? "You currently have access to this quiz. Start now and complete it at your best pace within the allowed duration."
                  : "Purchase this quiz to unlock access and start your attempt."}
              </p>

              <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Quiz Title</span>
                  <span className="max-w-[55%] truncate font-medium text-slate-800">
                    {quiz.title}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium text-slate-800">
                    {quiz.durationMinutes} minutes
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Questions</span>
                  <span className="font-medium text-slate-800">
                    {quiz.questions.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Passing Score</span>
                  <span className="font-medium text-slate-800">
                    {quiz.passingScore}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Price</span>
                  <span className="font-medium text-slate-800">
                    {quiz.price.toString()} {quiz.currency}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                {hasAccess ? (
                  <Link
                    href={`/quizzes/${quiz.slug}/start`}
                    className="w-full text-center bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Start Quiz
                  </Link>
                ) : session?.user?.email ? (
                  <BuyQuizButton quizId={quiz.id} />
                ) : (
                  <Link
                    href={`/login?callbackUrl=/quizzes/${quiz.slug}`}
                    className="w-full text-center bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Login to Buy
                  </Link>
                )}

                <Link
                  href="/quizzes"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-8 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Quizzes
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}