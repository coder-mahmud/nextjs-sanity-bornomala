import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-user";

type Body = {
  questionId: string;
  selectedOptionId: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireUser();
    const { attemptId } = await params;
    const body = (await req.json()) as Body;

    if (!body.questionId || !body.selectedOptionId) {
      return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
        quiz: {
          select: {
            durationMinutes: true,
          },
        },
      },
    });

    if (!attempt || attempt.userId !== dbUser.id) {
      return NextResponse.json({ message: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "STARTED") {
      return NextResponse.json({ message: "Attempt already submitted" }, { status: 400 });
    }

    const endsAt =
      new Date(attempt.startedAt).getTime() +
      attempt.quiz.durationMinutes * 60 * 1000;

    if (Date.now() > endsAt) {
      return NextResponse.json({ message: "Time is over" }, { status: 400 });
    }

    const validOption = await prisma.questionOption.findFirst({
      where: {
        id: body.selectedOptionId,
        questionId: body.questionId,
      },
      select: { id: true },
    });

    if (!validOption) {
      return NextResponse.json({ message: "Invalid option" }, { status: 400 });
    }

    await prisma.quizAttemptAnswer.update({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: body.questionId,
        },
      },
      data: {
        selectedOptionId: body.selectedOptionId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}