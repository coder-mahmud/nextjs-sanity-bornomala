import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EditScheduleForm from "./EditScheduleForm";
import { ArrowLeft } from "lucide-react";

interface EditSchedulePageProps {
  params: Promise<{ scheduleId: string }>;
}

export default async function EditSchedulePage({
  params,
}: EditSchedulePageProps) {
  const { scheduleId } = await params;
  const session = await auth();

  if (
    !session ||
    (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")
  ) {
    redirect("/dashboard");
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      entries: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!schedule) {
    notFound();
  }

  const branches = await prisma.branch.findMany({
    select: {
      id: true,
      name: true,
      address: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const serializedSchedule = JSON.parse(JSON.stringify(schedule));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Link
          href="/admin/schedules"
          className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Schedule</h1>
          <p className="text-xs text-gray-500">
            Update branch schedule timing, level, description, and time entries.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <EditScheduleForm
          schedule={serializedSchedule}
          branches={branches}
        />
      </div>
    </div>
  );
}