import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  console.log("Session from auth-user.ts:", session)

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  return session.user;
}