import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-user";
import { userHasQuizAccess } from "@/lib/quiz-access";
import { headers } from "next/headers";
import { auth } from "@/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // console.log("gEt quiz route hit!")
  try {
    const session = await auth();
    const cookieHeader = (await headers()).get("cookie");
    // console.log("cookie header:", cookieHeader);
    // console.log("session:", session);
  
    const user = await requireUser();
    const { slug } = await params;

    console.log("Quiz slug from route file:", slug)

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { slug },
      include: {
        questions: {
          select: { id: true },
        },
      },
    });

    if (!quiz || quiz.status !== "PUBLISHED") {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // const hasAccess = await userHasQuizAccess(dbUser.id, quiz.id);
    const hasAccess = true;

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      durationMinutes: quiz.durationMinutes,
      passingScore: quiz.passingScore,
      price: quiz.price.toString(),
      currency: quiz.currency,
      status: quiz.status,
      questionCount: quiz.questions.length,
      hasAccess,
    });
  } catch(err) {
    // console.log("Error:",err)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}