// app/components/HeaderUser.tsx
"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, LayoutDashboard, LogOut } from "lucide-react"
import Link from "next/link"

export default function HeaderUser({ isMobile = false, onItemClick }: { isMobile?: boolean; onItemClick?: () => void }) {
  const { data: session, status } = useSession()
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [session])

  if (status === "loading") return null

  // If user is not logged in
  if (!session) {
    return (
      <Link
        className={`hover:text-primary nav-underline ${isMobile ? 'block px-2 py-2 text-base border-b' : 'px-2 py-1'}`}
        href="/login"
        onClick={onItemClick}
      >
        Login
      </Link>
    )
  }

  const dashboardUrl = session?.user?.role === 'USER' ? '/dashboard' : '/admin/dashboard'

  // MOBILE VIEW: Render links inline seamlessly instead of a floating absolute dropdown
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        <Link
          className="flex items-center gap-2 text-primary font-bold px-2 py-2 border-b"
          href={dashboardUrl}
          onClick={onItemClick}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        <button
          onClick={() => {
            onItemClick?.()
            startTransition(async () => {
              await signOut({ redirect: false })
              router.refresh()
              router.push("/login")
            })
          }}
          disabled={pending}
          className="flex items-center gap-2 text-left font-bold text-red-600 px-2 py-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> {pending ? "Logging out..." : "Logout"}
        </button>
      </div>
    )
  }

  // DESKTOP VIEW: Floating Dropdown Menu
  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 border-2 border-primary cursor-pointer hover:bg-primary/20 transition"
      >
        <User className="w-5 h-5 text-primary" />
      </div>

      {open && (
        <div className="absolute top-[120%] right-0 w-40 py-2 bg-white border border-slate-200 shadow-xl flex flex-col items-center rounded-xl z-30">
          <Link
            className="text-slate-800 hover:bg-slate-50 font-medium px-4 py-2 text-center border-b border-slate-100 w-full text-sm transition"
            href={dashboardUrl}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <button
            onClick={() =>
              startTransition(async () => {
                await signOut({ redirect: false })
                router.refresh()
                router.push("/login")
              })
            }
            disabled={pending}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-center cursor-pointer transition"
          >
            {pending ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  )
}