// app/api/attempts/[attemptId]/cancel/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, userId: true, status: true },
    });

    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json(
        { message: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.status !== "STARTED") {
      return NextResponse.json(
        { message: "Only ongoing attempts can be cancelled." },
        { status: 400 }
      );
    }

    // Option A: Delete the attempt so it doesn't count towards maxAttempts limit
    await prisma.quizAttempt.delete({
      where: { id: attemptId },
    });

    /* 
    // Option B: If you prefer keeping a record:
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { status: "CANCELLED" },
    });
    */

    return NextResponse.json({ success: true, message: "Attempt cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling quiz attempt:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}