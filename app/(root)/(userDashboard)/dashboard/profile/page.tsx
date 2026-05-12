import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import SubmitButton from "@/components/shared/SubmitButton";

async function changePassword(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/dashboard/profile?error=missing-fields");
  }

  if (newPassword !== confirmPassword) {
    redirect("/dashboard/profile?error=password-mismatch");
  }

  if (newPassword.length < 6) {
    redirect("/dashboard/profile?error=password-too-short");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user || !user.password) {
    redirect("/dashboard/profile?error=password-not-available");
  }

  const passwordMatched = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!passwordMatched) {
    redirect("/dashboard/profile?error=current-password-wrong");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  redirect("/dashboard/profile?success=password-updated");
}

const UserProfilePage = async ({
  searchParams,
}: {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
}) => {
  const params = await searchParams;

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your account information and password settings.
        </p>
      </div>

      {params?.success === "password-updated" && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Password updated successfully.
        </div>
      )}

      {params?.error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error === "missing-fields" && "Please fill in all fields."}
          {params.error === "password-mismatch" &&
            "New password and confirm password do not match."}
          {params.error === "password-too-short" &&
            "Password must be at least 6 characters."}
          {params.error === "password-not-available" &&
            "Password change is not available for this account."}
          {params.error === "current-password-wrong" &&
            "Current password is incorrect."}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.name || "Student"}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <InfoRow label="Name" value={user.name || "Not provided"} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Role" value={user.role} />
            <InfoRow
              label="Joined"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Change Password
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update your account password.
          </p>

          <form action={changePassword} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <SubmitButton
              text="Update Password"
              loadingText="Updating..."
            />
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserProfilePage;

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <span className="font-medium text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
};