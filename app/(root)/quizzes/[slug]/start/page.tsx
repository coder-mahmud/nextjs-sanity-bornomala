import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userHasQuizAccess } from "@/lib/quiz-access";



async function getQuiz(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/quizzes/${slug}`, {
    cache: "no-store",
  });

  // console.log("api res msg:", res)
  const data = await res.json();

  // console.log("Response msg:",data.message);

  if (!res.ok) throw new Error("Failed to load quiz");
  return res.json();
}

async function createAttempt(quizId: string, userId:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/quizzes/${quizId}/start`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
    }),
  });

  const data = await res.json();
  // console.log("start api data:",data)

  if (!res.ok) throw new Error("Failed to start attempt");
  return data;
}

export default async function StartQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const session = await auth();
  const { slug } = await params;

  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/quizzes/${slug}/start`);
  }



  
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  // console.log("dbUser:", dbUser) // working

  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: {
      questions: {
        select: { id: true },
      },
    },
  });

  if (!quiz || quiz.status !== "PUBLISHED") {
    throw new Error("Quiz not found");
  }

  // console.log("Quiz:", quiz) // working

  const hasAccess = await userHasQuizAccess(dbUser.id, quiz.id);
  // console.log("hasAccess:", hasAccess)

  if (!hasAccess) {
    redirect(`/quizzes/${slug}`);

  }

  const { attemptId } = await createAttempt(quiz.id,dbUser.id );
  // console.log("attemptId", attemptId)
  redirect(`/quizzes/${slug}/attempt/${attemptId}`);

  // return(
  //   <h1>Quiz start page</h1>
  // )
}