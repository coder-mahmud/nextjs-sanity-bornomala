// components/courses/CoursePurchaseBox.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import BuyCourseButton from "@/components/courses/BuyCourseButton";

interface CoursePurchaseBoxProps {
  courseId: string;
  courseSlug: string;
  session: any;
  hasValidAccess: boolean; // Updated prop name
}

export default function CoursePurchaseBox({
  courseId,
  courseSlug,
  session,
  hasValidAccess,
}: CoursePurchaseBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  if (!session) {
    return (
      <Link
        href={`/login?callbackUrl=/courses/${courseSlug}`}
        className="inline-flex items-center justify-center gap-2 rounded bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 w-full"
      >
        Login to Take Course
      </Link>
    );
  }

  // Renders "Go to Course" only when access is active, not expired, and batch isn't completed/cancelled
  if (hasValidAccess) {
    return (
      <Link
        href={`/dashboard/courses/${courseSlug}`}
        className="inline-flex items-center justify-center gap-2 rounded bg-green-600 px-8 py-3 text-white hover:bg-green-700 w-full"
      >
        Go to Course
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded bg-[#3a7867] px-8 py-3 text-white hover:bg-white border border-[#3a7867] hover:text-[#3a7867] font-semibold cursor-pointer w-full"
      >
        Enroll Now
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative text-gray-800">
            <h3 className="text-2xl font-bold mb-2">Complete Your Enrollment</h3>
            <p className="text-sm text-gray-600 mb-6">
              Have a coupon code? Enter it below before proceeding with your purchase.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Coupon Code
              </label>
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              
              <BuyCourseButton courseId={courseId} couponCode={couponCode} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}