import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false as const,
      status: 401,
      message: "Unauthorized",
      user: null,
    };
  }

  const role = (session.user as { role?: string }).role;

  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return {
      ok: false as const,
      status: 403,
      message: "Forbidden",
      user: null,
    };
  }

  return {
    ok: true as const,
    status: 200,
    message: "Authorized",
    user: session.user,
  };
}