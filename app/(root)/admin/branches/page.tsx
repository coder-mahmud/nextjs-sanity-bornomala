import { prisma } from "@/lib/prisma";
import BranchForm from "./BranchForm";
import DeleteBranchButton from "./DeleteBranchButton";
import { Building2, MapPin, CalendarDays } from "lucide-react";

export interface BranchWithSchedules {
  id: string;
  name: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  schedules: Array<{ id: string; level: string | null }>;
}

export default async function BranchesPage() {
  const branches = (await prisma.branch.findMany({
    include: {
      schedules: {
        select: { id: true, level: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as unknown as BranchWithSchedules[];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
        <p className="text-sm text-gray-500">
          Create and manage campus or course locations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Branch Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 sticky top-6">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Add New Branch
            </h2>
            <BranchForm />
          </div>
        </div>

        {/* Branch List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">
            Existing Branches ({branches.length})
          </h2>

          {!branches.length ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">
                No branches added yet
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Use the form to create your first branch.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        {branch.name}
                      </h3>
                      {branch.address && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{branch.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 pt-1">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        {branch.schedules.length}{" "}
                        {branch.schedules.length === 1
                          ? "Schedule"
                          : "Schedules"}{" "}
                        linked
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <BranchForm branch={branch} />
                    <DeleteBranchButton branchId={branch.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}