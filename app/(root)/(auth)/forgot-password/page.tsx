"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
})

export default function ForgotPasswordPage() {
  const [pending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const parsed = schema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email")
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: parsed.data.email }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Something went wrong")
          return
        }

        setSuccessMessage(
          data.message ||
            "If an account exists with that email, a reset link has been sent."
        )
      } catch {
        setError("Network error. Please try again.")
      }
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Forgot your password?
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your registered email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {successMessage && (
            <p className="text-sm text-emerald-600">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 rounded-lg bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Remembered your password?{" "}
          <Link href="/login" className="text-black font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}