// app/dashboard/courses/[slug]/lessons/[lessonSlug]/quiz/[quizSlug]/start/page.tsx
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

  // 3. Check for any currently ACTIVE ("STARTED") attempt
  const activeAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: dbUser.id,
      quizId: quiz.id,
      status: AttemptStatus.STARTED,
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  // If there is already an ongoing active attempt, resume it instead of creating a new one
  if (activeAttempt) {
    redirect(`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/attempt/${activeAttempt.id}`);
  }

  // 4. Enforce France time window guard for launching a brand new attempt
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

  // 5. Fetch questions and create a brand new independent attempt for retaking
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

  // 6. Redirect directly to the newly created attempt page
  redirect(`/dashboard/courses/${slug}/lessons/${lessonSlug}/quiz/${quizSlug}/attempt/${newAttempt.id}`);
}