"use client";

import { useState } from "react";

export default function BuyQuizButton({
  quizId,
}: {
  quizId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizId }),
      });

      const data = await res.json();

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
      className="w-full rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {loading ? "Processing..." : "Buy Quiz"}
    </button>
  );
}