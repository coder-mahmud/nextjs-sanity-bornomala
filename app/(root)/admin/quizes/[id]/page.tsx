import { notFound } from "next/navigation";
import QuizForm from "@/components/admin/quiz-form";
import { prisma } from "@/lib/prisma";

type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuizDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <QuizForm
      mode="edit"
      quizId={quiz.id}
      initialValues={{
        title: quiz.title,
        slug: quiz.slug,
        description: quiz.description || "",
        price: quiz.price?.toString() || "0.00",
        currency: quiz.currency,
        durationMinutes: quiz.durationMinutes,
        passingScore: quiz.passingScore,
        status: quiz.status as QuizStatus,
        questions: quiz.questions.map((question) => ({
          text: question.text,
          explanation: question.explanation || "",
          marks: question.marks,
          order: question.order,
          options: question.options.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            order: option.order,
          })),
        })),
      }}
    />
  );
}