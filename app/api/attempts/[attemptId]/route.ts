// app/api/attempts/[attemptId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

type QuizAttemptWithQuizAndAnswers = Prisma.QuizAttemptGetPayload<{
  include: {
    quiz: {
      select: {
        id: true;
        title: true;
        durationMinutes: true;
      };
    };
    answers: {
      include: {
        question: {
          include: {
            options: {
              select: {
                id: true;
                text: true;
                order: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await _req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch attempt by its unique attemptId (Supports multiple attempts per user)
    const attempt = (await prisma.quizAttempt.findUnique({
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
    })) as unknown as QuizAttemptWithQuizAndAnswers | null;

    if (!attempt || attempt.userId !== dbUser.id) {
      return NextResponse.json(
        { message: "Attempt not found" },
        { status: 404 }
      );
    }

    // Optional: If you want students to view past submitted attempts in read-only mode,
    // you can remove or modify this check. If they are starting a brand new attempt,
    // status will be "STARTED" anyway.
    if (attempt.status !== "STARTED") {
      return NextResponse.json(
        { message: "This attempt is already submitted or closed." },
        { status: 400 }
      );
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
  } catch (error) {
    console.log("Error on api/attempts/[attemptid]/route", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}