import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await _req.json();
    const { userId } = body;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
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
        score: true,
        totalMarks: true,
        percentage: true,
        passed: true,
        resultPublished: true,
        submittedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
        // Include detailed question answers for the review breakdown
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            selectedOption: true,
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
      return NextResponse.json({ message: "Result not found" }, { status: 404 });
    }

    if (!attempt.resultPublished) {
      return NextResponse.json({ message: "Result not published yet" }, { status: 403 });
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.log("Error on api/attempts/[attemptid]/result/route", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}