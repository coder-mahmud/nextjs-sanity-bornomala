"use client";

import { useState } from "react";

export default function BuyCourseButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");

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
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Coupon code
        </label>

        <input
          type="text"
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          placeholder="Enter coupon code"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Buy Course"}
      </button>
    </div>
  );
}