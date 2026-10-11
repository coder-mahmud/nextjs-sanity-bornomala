import {auth} from '@/auth'
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getResult(attemptId: string, userId:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/attempts/${attemptId}/result`, {
    cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
    }),
  });

  const data = await res.json();
  // console.log("quiz res data:",data)
  if (!res.ok) throw new Error("Failed to load result");
  return data;
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  // console.log("attemptId from /quzzes/[slug]/result/[attemptid]/page",attemptId ) // working
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
  const result = await getResult(attemptId, userId);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border p-8">
        <h1 className="text-3xl font-bold">Quiz Result</h1>

        <div className="mt-6 space-y-3">
          <p>
            <span className="font-medium">Score:</span> {result.score} / {result.totalMarks}
          </p>
          <p>
            <span className="font-medium">Percentage:</span> {result.percentage}%
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            {result.passed ? "Passed" : "Failed"}
          </p>
        </div>
      </div>
    </main>
  );
}