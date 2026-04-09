import QuizPlayer from "@/components/quiz/quiz-player";
import {auth} from '@/auth'
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";




async function getAttempt(attemptId: string, userId:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/attempts/${attemptId}`, {
    cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
    }),
  });

  if (!res.ok) throw new Error("Failed to load attempt");
  return res.json();
}

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login");
  }
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  const userId = dbUser.id
  const attempt = await getAttempt(attemptId, userId);

  return <QuizPlayer initialData={attempt} />;
}