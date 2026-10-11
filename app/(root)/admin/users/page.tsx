import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import SubmitButton from "@/components/shared/SubmitButton";

type UserWithCount = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        payments: true;
        courseAccesses: true;
      };
    };
  };
}>;

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
    include: {
      _count: {
        select: {
          payments: true,
          courseAccesses: true,
        },
      },
    },
  })) as unknown as UserWithCount[];

  return (
    <section className="min-h-[70vh] bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Staff & Admin Accounts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage administrative personnel, superadmins, and staff roles[cite: 10].
          </p>
        </div>

        {params?.success === "role-updated" && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            User role updated successfully[cite: 10].
          </div>
        )}

        {params?.error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {params.error === "missing-fields" && "Missing user or role."}
            {params.error === "invalid-role" && "Invalid role selected."}
          </div>
        )}

        <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Course Accesses</th>
                <th className="px-6 py-4 font-semibold">Payments</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isCurrentUser = user.email === session.user?.email;

                return (
                  <tr key={user.id} className="transition hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                          {user.name?.charAt(0) ||
                            user.email.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name || "No name"}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {user._count.courseAccesses}
                    </td>

                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {user._count.payments}
                    </td>

                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      {session.user?.role === "SUPERADMIN" ? (
                        <>
                          <form action={updateUserRole} className="flex items-center gap-2">
                            <input type="hidden" name="userId" value={user.id} />

                            <select
                              name="role"
                              defaultValue={user.role}
                              disabled={isCurrentUser}
                              className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPERADMIN">SUPERADMIN</option>
                            </select>

                            <SubmitButton text="Update" loadingText="Updating..." />
                          </form>

                          {isCurrentUser && (
                            <p className="mt-1 text-[11px] text-gray-400">
                              You cannot change your own role[cite: 10].
                            </p>
                          )}
                        </>
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