import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  console.log("All quizes route hit!")

  const quizzes = await prisma.quiz.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: { createdAt: "desc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
      _count: {
        select: {
          questions: true,
          attempts: true,
          accesses: true,
          payments: true,
        },
      },
    },
  });

  return NextResponse.json({ quizzes });
}
