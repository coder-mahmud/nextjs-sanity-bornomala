import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import AllCoursesClient from "./AllCoursesClient";

export default async function AllCoursesPage() {
  const session = await auth();

  const rawCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
  });

  // Check user purchases to reflect correct button state (e.g. "Access Course" vs "Buy Course")
  let userAccesses: string[] = [];
  if (session?.user?.id) {
    const accesses = await prisma.courseAccess.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    });
    userAccesses = accesses.map((a) => a.courseId);
  }

  // Sort logic
  const courses = rawCourses.sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;

    if (orderA > 0 && orderB > 0) return orderA - orderB;
    if (orderA > 0) return -1;
    if (orderB > 0) return 1;

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const serializedCourses = JSON.parse(JSON.stringify(courses));

  return (
    <AllCoursesClient
      courses={serializedCourses}
      session={session}
      userAccesses={userAccesses}
    />
  );
}