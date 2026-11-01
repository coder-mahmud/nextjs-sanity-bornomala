// app/courses/page.tsx (or wherever AllCourses is located)
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import AllCoursesClient from "./AllCoursesClient";

export default async function AllCoursesPage() {
  const session = await auth();

  const rawCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
  });

  // Thorough validation for user course access
  let validCourseAccessIds: string[] = [];
  if (session?.user?.id) {
    const now = new Date();

    // 1. Fetch active course accesses (ignoring expired ones)
    const accesses = await prisma.courseAccess.findMany({
      where: {
        userId: session.user.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      include: {
        batch: {
          select: { id: true, status: true },
        },
      },
    });

    // 2. Filter out rows where the assigned batch is COMPLETED or CANCELLED
    const validAccesses = accesses.filter((access) => {
      if (!access.batchId) return true; // If no batch is linked, access remains valid
      const batchStatus = access.batch?.status;
      if (batchStatus === "COMPLETED" || batchStatus === "CANCELLED") {
        return false;
      }
      return true;
    });

    // 3. Collect unique valid course IDs
    validCourseAccessIds = Array.from(new Set(validAccesses.map((a) => a.courseId)));
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
      validCourseAccessIds={validCourseAccessIds}
    />
  );
}