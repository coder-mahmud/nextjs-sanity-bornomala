// app/(root)/admin/users/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import SubmitButton from "@/components/shared/SubmitButton";
import CreateUserModalButton from "./_components/CreateUserModalButton";

type UserWithoutRelations = Prisma.UserGetPayload<{}>;

async function updateUserRole(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session || session.user?.role !== "SUPERADMIN") {
    redirect("/admin/dashboard");
  }

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "USER" | "ADMIN" | "SUPERADMIN" | "STUDENT";

  if (!userId || !role) {
    redirect("/admin/users?error=missing-fields");
  }

  if (!["USER", "ADMIN", "SUPERADMIN", "STUDENT"].includes(role)) {
    redirect("/admin/users?error=invalid-role");
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });

  redirect("/admin/users?success=role-updated");
}

const AdminUsersPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
}) => {
  const params = await searchParams;

  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  // Fetch only Admin, Superadmin, and Staff/User roles (excluding standard students)
  const users = (await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "SUPERADMIN", "USER"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as unknown as UserWithoutRelations[];

  return (
    <section className="min-h-[70vh] bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Create User Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Staff & Admin Accounts
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage administrative personnel, superadmins, and staff roles.
            </p>
          </div>

          {session.user?.role === "SUPERADMIN" && (
            <CreateUserModalButton />
          )}
        </div>

        {params?.success === "role-updated" && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            User role updated successfully.
          </div>
        )}

        {params?.error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {params.error === "missing-fields" && "Missing user or role."}
            {params.error === "invalid-role" && "Invalid role selected."}
          </div>
        )}

        {/* Scrollable container for smaller screens */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="w-[35%] px-6 py-4 font-semibold">User</th>
                <th className="w-[20%] px-6 py-4 font-semibold">Role</th>
                <th className="w-[20%] px-6 py-4 font-semibold">Joined</th>
                <th className="w-[25%] px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isCurrentUser = user.email === session.user?.email;

                return (
                  <tr key={user.id} className="transition hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                          {user.name?.charAt(0) ||
                            user.email.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">
                            {user.name || "No name"}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      {session.user?.role === "SUPERADMIN" ? (
                        <div className="flex flex-col items-start gap-1">
                          <form action={updateUserRole} className="flex items-center gap-2">
                            <input type="hidden" name="userId" value={user.id} />

                            <select
                              name="role"
                              defaultValue={user.role}
                              disabled={isCurrentUser}
                              className="rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 cursor-pointer bg-white"
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPERADMIN">SUPERADMIN</option>
                            </select>

                            <SubmitButton text="Save" loadingText="..." />
                          </form>

                          {isCurrentUser && (
                            <p className="text-[10px] text-gray-400">
                              Cannot change own role.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-gray-400">Superadmin only</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminUsersPage;