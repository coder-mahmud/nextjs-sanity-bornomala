import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import Link from "next/link";
import { Eye, UserX, UserCheck, AlertTriangle } from "lucide-react";
import SubmitButton from "@/components/shared/SubmitButton";

type StudentWithCount = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        courseAccesses: true;
        payments: true;
        quizAttempts: true;
      };
    };
  };
}>;

async function toggleStudentStatus(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
    redirect("/dashboard");
  }

  const userId = formData.get("userId") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !currentStatus },
  });

  redirect("/admin/students?success=status-updated");
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    success?: string;
    disableId?: string;
    disableName?: string;
    disableStatus?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
    redirect("/dashboard");
  }

  const students = (await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          courseAccesses: true,
          payments: true,
          quizAttempts: true,
        },
      },
    },
  })) as unknown as StudentWithCount[];

  const modalUserId = params?.disableId;
  const modalUserName = params?.disableName || "this student";
  const modalCurrentStatus = params?.disableStatus === "true";

  return (
    <section className="min-h-[70vh] bg-slate-50 py-10 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Student Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage registered student accounts, active status, and overview profiles.
          </p>
        </div>

        {params?.success === "status-updated" && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Student account status updated successfully.
          </div>
        )}

        <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Courses</th>
                <th className="px-6 py-4 font-semibold">Payments</th>
                <th className="px-6 py-4 font-semibold">Attempts</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-xs">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const studentName = student.name || "Unnamed Student";

                  return (
                    <tr key={student.id} className="transition hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                            {student.name?.charAt(0) || student.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">
                              {studentName}
                            </p>
                            <p className="text-[11px] text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          student.isActive 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                          {student.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-gray-600">
                        {student._count.courseAccesses}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-gray-600">
                        {student._count.payments}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-gray-600">
                        {student._count.quizAttempts}
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Eye className="h-5 w-5 text-gray-500" />
                          </Link>

                          {student.isActive ? (
                            <Link
                              href={`/admin/students?disableId=${student.id}&disableName=${encodeURIComponent(studentName)}&disableStatus=true`}
                              className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 border border-red-200 transition"
                            >
                              <UserX className="h-3.5 w-3.5" /> Disable
                            </Link>
                          ) : (
                            <form action={toggleStudentStatus}>
                              <input type="hidden" name="userId" value={student.id} />
                              <input type="hidden" name="currentStatus" value="false" />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition"
                              >
                                <UserCheck className="h-3.5 w-3.5" /> Enable
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Professional Confirmation Modal Popup */}
        {modalUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mx-auto border border-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900">
                  Disable Student Account?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed px-4">
                  Are you sure you want to disable access for <strong className="text-gray-800">{modalUserName}</strong>? They will be unable to log in or access course materials until re-enabled.
                </p>
              </div>

              <form action={toggleStudentStatus} className="flex gap-3 pt-2">
                <input type="hidden" name="userId" value={modalUserId} />
                <input type="hidden" name="currentStatus" value={String(modalCurrentStatus)} />

                <Link
                  href="/admin/students"
                  className="flex-1 text-center rounded-xl border border-gray-300 bg-white py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </Link>

                <div className="flex-1">
                  <SubmitButton 
                    text="Yes, Disable" 
                    loadingText="Disabling..." 
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}