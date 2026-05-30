// app/admin/coupons/[id]/edit/CouponEditForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface Course {
  id: string;
  title: string;
}

interface Quiz {
  id: string;
  title: string;
}

interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: string;
  maxUses: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
  courseId: string | null;
  quizId: string | null;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CouponEditFormProps {
  coupon: Coupon;
  courses: Course[];
  quizzes: Quiz[];
}

function formatDateTimeLocal(isoDate?: string | null) {
  if (!isoDate) return "";

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function localDateTimeToISOString(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export default function CouponEditForm({
  coupon,
  courses,
  quizzes,
}: CouponEditFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [couponType, setCouponType] = useState<"PERCENT" | "FIXED">(
    coupon.type
  );
  const [courseId, setCourseId] = useState(coupon.courseId ?? "");
  const [quizId, setQuizId] = useState(coupon.quizId ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      id: coupon.id,
      code: String(formData.get("code") || "").trim(),
      type: String(formData.get("type") || "PERCENT"),
      value: String(formData.get("value") || "").trim(),
      maxUses: String(formData.get("maxUses") || "").trim() || null,
      startsAt: localDateTimeToISOString(formData.get("startsAt")),
      expiresAt: localDateTimeToISOString(formData.get("expiresAt")),
      active: formData.get("active") === "on",
      courseId: String(formData.get("courseId") || "").trim() || null,
      quizId: String(formData.get("quizId") || "").trim() || null,
    };

    try {
      const res = await fetch("/api/admin/coupons/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update coupon");
      }

      toast.success("Coupon updated successfully!");

      router.push("/admin/coupons");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="code"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Coupon Code
        </label>

        <input
          id="code"
          name="code"
          type="text"
          defaultValue={coupon.code}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="type"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Type
        </label>

        <select
          id="type"
          name="type"
          value={couponType}
          onChange={(e) =>
            setCouponType(e.target.value as "PERCENT" | "FIXED")
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="PERCENT">Percent Discount</option>
          <option value="FIXED">Fixed Amount</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="value"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Value
        </label>

        <input
          id="value"
          name="value"
          type="number"
          min="0.01"
          max={couponType === "PERCENT" ? "100" : undefined}
          step="0.01"
          defaultValue={coupon.value}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {couponType === "PERCENT" && (
          <p className="mt-1 text-xs text-gray-500">
            Percent coupons cannot be greater than 100.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="maxUses"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Max Uses
        </label>

        <input
          id="maxUses"
          name="maxUses"
          type="number"
          min={Math.max(1, coupon.usedCount)}
          defaultValue={coupon.maxUses?.toString() || ""}
          placeholder="Leave empty for unlimited"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {coupon.usedCount > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            This coupon has already been used {coupon.usedCount} time
            {coupon.usedCount === 1 ? "" : "s"}.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="startsAt"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Starts At
          </label>

          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(coupon.startsAt)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="expiresAt"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Expires At
          </label>

          <input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(coupon.expiresAt)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="courseId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Course Optional
          </label>

          <select
            id="courseId"
            name="courseId"
            value={courseId}
            onChange={(e) => {
              const value = e.target.value;
              setCourseId(value);

              if (value) {
                setQuizId("");
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">-- None --</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="quizId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Quiz Optional
          </label>

          <select
            id="quizId"
            name="quizId"
            value={quizId}
            onChange={(e) => {
              const value = e.target.value;
              setQuizId(value);

              if (value) {
                setCourseId("");
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">-- None --</option>

            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          name="active"
          type="checkbox"
          defaultChecked={coupon.active}
          className="h-4 w-4 rounded border-gray-300"
        />
        Active
      </label>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Update Coupon"}
        </button>

        <Link
          href="/admin/coupons"
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}