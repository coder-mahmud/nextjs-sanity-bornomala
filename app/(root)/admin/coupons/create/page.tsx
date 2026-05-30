// app/admin/coupons/create/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

async function createCoupon(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.email || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const type = String(formData.get("type") || "PERCENT") as "PERCENT" | "FIXED";
  const value = Number(formData.get("value") || 0);
  const maxUsesRaw = String(formData.get("maxUses") || "").trim();
  const startsAtRaw = String(formData.get("startsAt") || "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();
  const active = formData.get("active") === "on";

  // Optional course/quiz assignment
  const courseId = String(formData.get("courseId") || "").trim() || null;
  const quizId = String(formData.get("quizId") || "").trim() || null;

  if (!code) throw new Error("Coupon code is required");
  if (value <= 0) throw new Error("Coupon value must be greater than 0");
  if (type === "PERCENT" && value > 100) throw new Error("Percent coupon cannot be greater than 100");
  if (courseId && quizId) throw new Error("Coupon can be assigned to either a course or a quiz, not both");

  await prisma.coupon.create({
    data: {
      code,
      type,
      value,
      active,
      maxUses: maxUsesRaw ? Number(maxUsesRaw) : null,
      startsAt: startsAtRaw ? new Date(startsAtRaw) : null,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      courseId: courseId || null,
      quizId: quizId || null,
    },
  });

  redirect("/admin/coupons");
}

export default async function CreateCouponPage() {
  const session = await auth();
  if (!session?.user?.email || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({ orderBy: { title: "asc" } });
  const quizzes = await prisma.quiz.findMany({ orderBy: { title: "asc" } });

  return (
    <section className="mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <Link href="/admin/coupons" className="text-sm text-blue-600 hover:underline">
          ← Back to Coupons
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Create Coupon</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a coupon for courses or quizzes with optional validity period.
        </p>
      </div>

      <form action={createCoupon} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Coupon Code */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Coupon Code</label>
          <input
            name="code"
            type="text"
            placeholder="SAVE20"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Discount Type</label>
          <select
            name="type"
            defaultValue="PERCENT"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="PERCENT">Percent Discount</option>
            <option value="FIXED">Fixed Amount Discount</option>
          </select>
        </div>

        {/* Value */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Discount Value</label>
          <input
            name="value"
            type="number"
            min="0"
            step="0.01"
            placeholder="20"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            For percent, use 20 for 20%. For fixed, use amount like 10.
          </p>
        </div>

        {/* Max Uses */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Max Uses</label>
          <input
            name="maxUses"
            type="number"
            min="1"
            placeholder="Leave empty for unlimited"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Start / Expiry Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Starts At</label>
            <input
              name="startsAt"
              type="datetime-local"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expires At</label>
            <input
              name="expiresAt"
              type="datetime-local"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Assign to Course or Quiz */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Course (optional)</label>
            <select name="courseId" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="">-- None --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quiz (optional)</label>
            <select name="quizId" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="">-- None --</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input name="active" type="checkbox" defaultChecked />
          Active
        </label>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create Coupon
          </button>
          <Link
            href="/admin/coupons"
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}