// app/admin/coupons/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminCouponsPage() {
  const session = await auth();

  if (!session?.user?.email || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <Link
          href="/admin/coupons/create"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create New Coupon
        </Link>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-gray-500">No coupons found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Usage</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Valid Until</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{coupon.type}</td>
                  <td className="px-4 py-3 text-gray-600">{Number(coupon.value)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.usedCount} / {coupon.maxUses ?? "∞"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.active ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString()
                      : "∞"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/coupons/${coupon.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}