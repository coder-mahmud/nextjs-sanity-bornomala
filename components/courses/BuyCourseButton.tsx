"use client";
import { useState } from "react";

export default function BuyCourseButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();
      if (!data.url) throw new Error("Checkout URL not returned");

      // ⚡ New Stripe redirect method
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
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : "Buy Course"}
    </button>
  );
}