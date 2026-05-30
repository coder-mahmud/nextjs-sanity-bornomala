// app/admin/coupons/[id]/edit/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CouponEditForm from "./CouponEditForm";

interface EditCouponPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const { id } = await params;

  const session = await auth();

  if (
    !session?.user?.email ||
    !["ADMIN", "SUPERADMIN"].includes(session.user.role)
  ) {
    redirect("/login");
  }

  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    redirect("/admin/coupons");
  }

  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
    },
  });

  const quizzes = await prisma.quiz.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
    },
  });

  const couponPlain = {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value.toFixed(2),
    maxUses: coupon.maxUses ?? null,
    startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
    active: coupon.active,
    courseId: coupon.courseId ?? null,
    quizId: coupon.quizId ?? null,
    usedCount: coupon.usedCount,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };

  return (
    <section className="mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <Link
          href="/admin/coupons"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Coupons
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Edit Coupon
        </h1>
      </div>

      <CouponEditForm
        coupon={couponPlain}
        courses={courses}
        quizzes={quizzes}
      />
    </section>
  );
}