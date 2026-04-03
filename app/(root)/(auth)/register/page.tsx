"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { registerAction } from "./actions"
import { Eye, EyeClosed } from "lucide-react"


const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});

export default function RegisterPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setConfirmShowPass] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    startTransition(async () => {
      const res = await registerAction(parsed.data)
      if (!res.ok) {
        setError(res.error ?? "Registration failed")
        return
      }

      router.push("/login")
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Create your account
        </h1>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPass ? 'text' : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
              />
              <span onClick={() => setShowPass(!showPass)} className="absolute right-2 top-[35%]">
                {showPass? (
                  <EyeClosed className="w-4 h-4 cursor-pointer" />
                ) : (
                  <Eye className="w-4 h-4 cursor-pointer" />
                )}
              </span>
            </div>

          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : "password"}
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
              />
              <span onClick={() => setConfirmShowPass(!showConfirmPass)} className="absolute right-2 top-[35%]">
                {showConfirmPass? (
                  <EyeClosed className="w-4 h-4 cursor-pointer" />
                ) : (
                  <Eye className="w-4 h-4 cursor-pointer" />
                )}
              </span>
            </div>

          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 rounded-lg bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {pending ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-black font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}