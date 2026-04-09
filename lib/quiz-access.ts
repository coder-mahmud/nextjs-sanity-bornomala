import { prisma } from "@/lib/prisma";

export async function userHasQuizAccess(userId: string, quizId: string) {
  if (process.env.BYPASS_PAYMENT === "true") return true;

  const access = await prisma.quizAccess.findUnique({
    where: {
      userId_quizId: {
        userId,
        quizId,
      },
    },
  });

  // uncomment next 2 blocks for production use. I am bypassing for development.
  
  if (!access) return false;
  if (access.expiresAt && access.expiresAt < new Date()) {
    return false;
  }

  return true;
}