// app/(root)/(userDashboard)/dashboard/courses/[slug]/layout.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import React from "react";

type CourseLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function CourseSlugLayout({
  children,
  params,
}: CourseLayoutProps) {
  const { slug } = await params;

  // 1. Authenticate user
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) redirect("/login");

  // Optional: Superadmins can bypass access checks
  if (user.role === "SUPERADMIN" || user.role === "ADMIN") {
    return <>{children}</>;
  }

  // 2. Find the course ID matching this slug
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!course) {
    redirect("/dashboard/courses");
  }

  const now = new Date();

  // 3. Check if the user has active access to this course
  const courseAccess = await prisma.courseAccess.findFirst({
    where: {
      userId: user.id,
      courseId: course.id,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      batch: {
        select: { status: true },
      },
    },
  });

  // If no access record exists, redirect away
  if (!courseAccess) {
    redirect("/dashboard/courses");
  }

  // 4. Check if a batch is selected and if its status is COMPLETED or CANCELLED
  if (courseAccess.batch && courseAccess.batch.status) {
    const batchStatus = courseAccess.batch.status;
    if (batchStatus === "COMPLETED" || batchStatus === "CANCELLED") {
      redirect("/dashboard/courses");
    }
  }

  // If all checks pass, render the course layout / pages normally
  return <>{children}</>;
}