// components/courses/BuyCourseButton.tsx
"use client";

import { useState } from "react";

interface BuyCourseButtonProps {
  courseId: string;
  couponCode?: string;
}

export default function BuyCourseButton({ courseId, couponCode = "" }: BuyCourseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          couponCode: couponCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (!data.url) {
        throw new Error("Checkout URL not returned");
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : "Buy Course"}
    </button>
  );
}