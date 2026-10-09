import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Calendar, Clock, MapPin, Pencil } from "lucide-react";
import DeleteScheduleButton from "./DeleteScheduleButton";

export interface ScheduleWithRelations {
  id: string;
  level: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  branchId: string;
  branch: {
    id: string;
    name: string;
    address: string | null;
  };
  entries: Array<{
    id: string;
    day: string;
    time: string;
    startingDate: string;
  }>;
  parisCourses: Array<{ id: string; title: string }>;
  hocheCourses: Array<{ id: string; title: string }>;
}

export default async function SchedulesPage() {
  const schedules = (await prisma.schedule.findMany({
    include: {
      branch: true,
      entries: {
        orderBy: { createdAt: "asc" },
      },
      parisCourses: { select: { id: true, title: true } },
      hocheCourses: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  })) as unknown as ScheduleWithRelations[];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Schedules</h1>
          <p className="text-sm text-gray-500">
            Manage course timing, weekly entries, and branch assignments.
          </p>
        </div>
        <Link
          href="/admin/schedules/create"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Create Schedule
        </Link>
      </div>

      {!schedules.length ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">
            No schedules created yet
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Start by adding a schedule for your branch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{schedule.branch.name}</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                      {schedule.level || "General Schedule"}
                    </h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/schedules/${schedule.id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Schedule"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteScheduleButton scheduleId={schedule.id} />
                  </div>
                </div>

                {schedule.description && (
                  <p className="text-xs text-gray-600">{schedule.description}</p>
                )}

                <div className="space-y-2 border-t pt-3">
                  <h4 className="text-xs font-semibold text-gray-700">
                    Time Entries:
                  </h4>
                  {schedule.entries.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">
                      No time slots specified
                    </span>
                  ) : (
                    <div className="space-y-1.5">
                      {schedule.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                        >
                          <div className="font-medium text-gray-800 space-y-0.5">
                            <div>{entry.day}</div>
                            <div className="text-[11px] text-gray-500">
                              ক্লাস স্টার্ট: {entry.startingDate}
                            </div>
                          </div>
                          <span className="text-gray-600 flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            {entry.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {(schedule.parisCourses.length > 0 ||
                schedule.hocheCourses.length > 0) && (
                <div className="border-t pt-3 text-xs text-gray-500 space-y-1">
                  {schedule.parisCourses.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700">
                        Paris Courses:{" "}
                      </span>
                      {schedule.parisCourses.map((c) => c.title).join(", ")}
                    </div>
                  )}
                  {schedule.hocheCourses.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700">
                        Hoche Courses:{" "}
                      </span>
                      {schedule.hocheCourses.map((c) => c.title).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}