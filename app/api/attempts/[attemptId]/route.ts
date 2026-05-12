import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-user";

export async function POST(
  _req: Request, { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    // const user = await requireUser();
    const { attemptId } = await params;
    console.log("attempt id from [attemptId]/route:",attemptId )
    const body = await _req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    console.log("User id from route file: [attemptId]/route", userId)



    const dbUser = await prisma.user.findUnique({
      where: { id:userId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    text: true,
                    order: true,
                  },
                },
              },
            },
          },
          orderBy: {
            question: {
              order: "asc",
            },
          },
        },
      },
    });

    if (!attempt || attempt.userId !== dbUser.id) {
      return NextResponse.json({ message: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "STARTED") {
      return NextResponse.json({ message: "Attempt already closed" }, { status: 400 });
    }

    return NextResponse.json({
      id: attempt.id,
      startedAt: attempt.startedAt,
      status: attempt.status,
      quiz: attempt.quiz,
      questions: attempt.answers.map((a) => ({
        id: a.question.id,
        text: a.question.text,
        order: a.question.order,
        selectedOptionId: a.selectedOptionId,
        options: a.question.options,
      })),
    });
  } catch(error) {
    console.log("Error on api/attempts/[attemptid]/route", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}