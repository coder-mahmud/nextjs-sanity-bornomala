import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { userHasQuizAccess } from "@/lib/quiz-access";

type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: {
    questions: {
      select: {
        id: true;
      };
    };
  };
}>;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const quiz = (await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: { id: true },
        },
      },
    })) as unknown as QuizWithQuestions | null;

    if (!quiz || quiz.status !== "PUBLISHED") {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    const hasAccess = await userHasQuizAccess(dbUser.id, quiz.id);
    if (!hasAccess) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const existingStartedAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: dbUser.id,
        quizId: quiz.id,
        status: "STARTED",
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });

    if (existingStartedAttempt) {
      return NextResponse.json({
        attemptId: existingStartedAttempt.id,
      });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: dbUser.id,
        quizId: quiz.id,
        status: "STARTED",
        answers: {
          create: quiz.questions.map((q) => ({
            questionId: q.id,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}