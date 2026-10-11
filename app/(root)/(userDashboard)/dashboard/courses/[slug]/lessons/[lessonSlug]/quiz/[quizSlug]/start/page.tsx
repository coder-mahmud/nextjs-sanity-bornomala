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

  // 2. Fetch Lesson & Quiz metadata safely (including schedule windows)
  const lesson = await prisma.lesson.findUnique({
    where: { slug: lessonSlug },
    select: { startsAt: true, endsAt: true },
  });

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

  // If an existing attempt is already finished/submitted, redirect to result
  if (
    existingAttempt &&
    (existingAttempt.status === AttemptStatus.SUBMITTED ||
     existingAttempt.status === AttemptStatus.EVALUATED)
  ) {
    redirect(`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/result/${existingAttempt.id}`);
  }

  // If an active attempt exists, they can continue even if the window just closed, 
  // but if NO attempt exists, we must enforce the France time window guard.
  if (!existingAttempt) {
    const timeZone = "Europe/Paris";
    const nowParisTime = new Date(new Date().toLocaleString("en-US", { timeZone })).getTime();
    const startTime = lesson?.startsAt ? new Date(new Date(lesson.startsAt).toLocaleString("en-US", { timeZone })).getTime() : null;
    const endTime = lesson?.endsAt ? new Date(new Date(lesson.endsAt).toLocaleString("en-US", { timeZone })).getTime() : null;

    const isBeforeStart = startTime !== null ? nowParisTime < startTime : false;
    const isAfterEnd = endTime !== null ? nowParisTime > endTime : false;

    // Block starting a new attempt outside the allowed France time window
    if (isBeforeStart || isAfterEnd) {
      redirect(`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}`);
    }
  }

  let attemptId: string;

  if (existingAttempt) {
    redirect(`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/attempt/${existingAttempt.id}`);
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