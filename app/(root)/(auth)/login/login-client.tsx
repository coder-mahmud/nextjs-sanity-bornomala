"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { Eye, EyeClosed } from "lucide-react"
import { getSession } from "next-auth/react"


const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client validation
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }


    startTransition(async () => {
      const res = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      })

      // console.log("Res from user login form:", res)
  
      if (res?.error) {
        setError("Invalid email or password")
        return
      }
      const session = await getSession()
      const role = session?.user?.role
      // console.log("Role from login form:", role)
      if(role === 'ADMIN' || role === 'SUPERADMIN'){
        router.push("/admin/dashboard")
      }else{
        router.push("/dashboard")
      }
  
     
    })

  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Sign in to your account
        </h1>

        <form onSubmit={onSubmit} className="space-y-5">
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

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 rounded-lg bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Login"}
          </button>
        </form>


        {/* <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full py-2 mt-4 border rounded-lg text-black cursor-pointer"
        >
          Continue with Google
        </button> */}

        <p className="text-sm text-center mt-6 text-gray-500">
          Don't have an account?{" "}
          <a href="/register" className="text-black font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}