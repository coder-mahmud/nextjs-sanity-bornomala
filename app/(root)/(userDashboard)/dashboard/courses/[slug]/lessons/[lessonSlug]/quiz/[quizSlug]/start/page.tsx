import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@/prisma/generated/prisma/client";

interface StartQuizPageProps {
  params: Promise<{
    slug: string;
    lessonSlug: string;
    quizSlug: string;
  }>;
}

export default async function StartQuizPage({ params }: StartQuizPageProps) {
  const session = await auth();
  const { slug, lessonSlug, quizSlug } = await params;

  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  // 1. Verify Course Access
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!course) {
    redirect("/dashboard/courses");
  }

  const access = await prisma.courseAccess.findFirst({
    where: {
      userId: dbUser.id,
      courseId: course.id,
    },
  });

  if (!access) {
    redirect(`/dashboard/courses/${slug}`);
  }

  // 2. Fetch Quiz metadata safely
  const quiz = await prisma.quiz.findUnique({
    where: { slug: quizSlug },
    select: { id: true, status: true },
  });

  if (!quiz || quiz.status !== "PUBLISHED") {
    throw new Error("Quiz not found");
  }

  // 3. Check for an existing attempt
  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: dbUser.id,
      quizId: quiz.id,
    },
    select: { id: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  let attemptId: string;

  if (existingAttempt) {
    // Check against available enum values: SUBMITTED or EVALUATED means finished/completed
    if (
      existingAttempt.status === AttemptStatus.SUBMITTED ||
      existingAttempt.status === AttemptStatus.EVALUATED
    ) {
      redirect(`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/result/${existingAttempt.id}`);
    } else {
      redirect(`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/attempt/${existingAttempt.id}`);
    }
  }

  // Fetch questions separately if no attempt exists
  const questions = await prisma.question.findMany({
    where: { quizId: quiz.id },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  const newAttempt = await prisma.quizAttempt.create({
    data: {
      userId: dbUser.id,
      quizId: quiz.id,
      status: AttemptStatus.STARTED,
      answers: {
        create: questions.map((q) => ({
          questionId: q.id,
        })),
      },
    },
    select: {
      id: true,
    },
  });
  
  attemptId = newAttempt.id;

  // 4. Redirect directly to the nested attempt page
  redirect(`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/attempt/${attemptId}`);
}