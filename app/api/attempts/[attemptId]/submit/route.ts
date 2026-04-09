import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-user";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt || attempt.userId !== dbUser.id) {
      return NextResponse.json({ message: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "STARTED") {
      return NextResponse.json({ message: "Attempt already submitted" }, { status: 400 });
    }

    const answerMap = new Map(
      attempt.answers.map((a) => [a.questionId, a])
    );

    let score = 0;
    let totalMarks = 0;

    const answerUpdates: Array<Promise<unknown>> = [];

    for (const question of attempt.quiz.questions) {
      totalMarks += question.marks;

      const attemptAnswer = answerMap.get(question.id);
      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect =
        !!attemptAnswer?.selectedOptionId &&
        attemptAnswer.selectedOptionId === correctOption?.id;

      const awardedMarks = isCorrect ? question.marks : 0;
      score += awardedMarks;

      if (attemptAnswer) {
        answerUpdates.push(
          prisma.quizAttemptAnswer.update({
            where: {
              attemptId_questionId: {
                attemptId: attempt.id,
                questionId: question.id,
              },
            },
            data: {
              isCorrect,
              awardedMarks,
            },
          })
        );
      }
    }

    await prisma.$transaction(answerUpdates as any);

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const passed = percentage >= attempt.quiz.passingScore;

    await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "EVALUATED",
        submittedAt: new Date(),
        score,
        totalMarks,
        percentage,
        passed,
      },
    });

    return NextResponse.json({
      ok: true,
      score,
      totalMarks,
      percentage,
      passed,
    });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}