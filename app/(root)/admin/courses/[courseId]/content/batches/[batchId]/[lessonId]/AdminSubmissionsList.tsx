// app/(root)/admin/courses/[courseId]/content/batches/[batchId]/lessons/[lessonId]/AdminSubmissionsList.tsx
"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Video, Download, ExternalLink, Trash2, Eye, X, CheckCircle, XCircle, Shield } from "lucide-react";

interface StudentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date | string;
}

interface SubmissionItem {
  id: string;
  fileUrl: string | null;
  videoUrl: string | null;
  comment: string | null;
  createdAt: Date | string;
  user: StudentUser;
}

interface AdminSubmissionsListProps {
  submissions: SubmissionItem[];
  courseId: string;
  batchId: string;
  lessonId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}

export default function AdminSubmissionsList({
  submissions,
  courseId,
  batchId,
  lessonId,
  deleteAction,
}: AdminSubmissionsListProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <UploadCloud className="w-4 h-4 text-emerald-600" />
          Student Homework Submissions ({submissions.length})
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-3"
            >
              {/* Student Info Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-xs text-gray-700">
                    {sub.user?.image ? (
                      <img src={sub.user.image} alt={sub.user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      (sub.user?.name || sub.user?.email || "U")[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900">{sub.user?.name || "Unknown Student"}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(sub.user)}
                        title="View Student Profile Details"
                        className="text-indigo-600 hover:text-indigo-800 transition p-0.5 rounded cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500">{sub.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {mounted ? new Date(sub.createdAt).toLocaleString() : ""}
                  </span>
                  
                  {/* Manual Delete Form */}
                  <form action={deleteAction}>
                    <input type="hidden" name="submissionId" value={sub.id} />
                    <input type="hidden" name="courseId" value={courseId} />
                    <input type="hidden" name="batchId" value={batchId} />
                    <input type="hidden" name="lessonId" value={lessonId} />
                    <button
                      type="submit"
                      title="Delete Submission"
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Submission Content (File & Video Link) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {sub.fileUrl ? (
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs transition shadow-2xs"
                  >
                    <span className="font-medium text-gray-700 truncate max-w-[180px]">
                      📄 View File Document
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 shrink-0">
                      <Download className="w-3.5 h-3.5" /> Download
                    </span>
                  </a>
                ) : (
                  <div className="p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-400 italic flex items-center">
                    No file document uploaded
                  </div>
                )}

                {sub.videoUrl ? (
                  <a
                    href={sub.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-xs transition text-blue-700 font-medium"
                  >
                    <span className="truncate max-w-[180px] flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 shrink-0 text-blue-600" /> Watch Video Link
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <div className="p-2.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-400 italic flex items-center">
                    No video link provided
                  </div>
                )}
              </div>

              {sub.comment && (
                <div className="text-xs bg-white p-3 rounded-lg border border-gray-200 text-gray-700">
                  <span className="font-semibold block text-[11px] text-gray-500 mb-0.5">Comment:</span>
                  {sub.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic py-4 text-center">
          No student homework submissions found for this lesson yet.
        </p>
      )}

      {/* Student Details Popup Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Student Profile Details</h3>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-lg text-gray-700 shadow-inner shrink-0">
                {selectedStudent.image ? (
                  <img src={selectedStudent.image} alt={selectedStudent.name || ""} className="w-full h-full object-cover" />
                ) : (
                  (selectedStudent.name || selectedStudent.email || "U")[0].toUpperCase()
                )}
              </div>
              <div className="space-y-1 overflow-hidden">
                <h4 className="text-base font-bold text-gray-900 truncate">{selectedStudent.name || "N/A"}</h4>
                <p className="text-xs text-gray-500 truncate">{selectedStudent.email}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-indigo-100">
                    <Shield className="w-3 h-3" /> {selectedStudent.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      selectedStudent.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {selectedStudent.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {selectedStudent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2 border-t text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400 font-medium">User ID:</span>
                <span className="font-mono text-gray-700">{selectedStudent.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Account Created:</span>
                <span className="text-gray-700 font-medium">
                  {mounted ? new Date(selectedStudent.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-full rounded-xl bg-black py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}