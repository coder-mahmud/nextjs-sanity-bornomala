import { prisma } from "@/lib/prisma";
import CreateScheduleForm from "./CreateScheduleForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CreateSchedulePage() {
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
          <h1 className="text-xl font-bold text-gray-900">Create Schedule</h1>
          <p className="text-xs text-gray-500">Configure new time slots and attach them to a branch.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <CreateScheduleForm branches={branches} />
      </div>
    </div>
  );
}