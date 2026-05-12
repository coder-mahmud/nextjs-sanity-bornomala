import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubmitButton from "@/components/shared/SubmitButton";

async function updateUserRole(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session || session.user?.role !== "SUPERADMIN") {
    redirect("/admin/dashboard");
  }

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "USER" | "ADMIN" | "SUPERADMIN";

  if (!userId || !role) {
    redirect("/admin/users?error=missing-fields");
  }

  if (!["USER", "ADMIN", "SUPERADMIN"].includes(role)) {
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

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          quizAttempts: true,
          payments: true,
          quizAccesses: true,
        },
      },
    },
  });

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage registered users and view user activity.
        </p>
      </div>

      {params?.success === "role-updated" && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          User role updated successfully.
        </div>
      )}

      {params?.error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error === "missing-fields" && "Missing user or role."}
          {params.error === "invalid-role" && "Invalid role selected."}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Quiz Access</th>
              <th className="px-4 py-3 font-medium">Attempts</th>
              <th className="px-4 py-3 font-medium">Payments</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isCurrentUser = user.email === session.user?.email;

              return (
                <tr key={user.id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                        {user.name?.charAt(0) ||
                          user.email.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {user.name || "No name"}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {user._count.quizAccesses}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {user._count.quizAttempts}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {user._count.payments}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4">
                    {session.user?.role === "SUPERADMIN" ? (
                      <>
                        <form action={updateUserRole} className="flex gap-2">
                          <input type="hidden" name="userId" value={user.id} />

                          <select
                            name="role"
                            defaultValue={user.role}
                            disabled={isCurrentUser}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPERADMIN">SUPERADMIN</option>
                          </select>

                          <SubmitButton text="Update" loadingText="Updating..." />
                        </form>

                        {isCurrentUser && (
                          <p className="mt-1 text-xs text-gray-400">
                            You cannot change your own role.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Superadmin only</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminUsersPage;