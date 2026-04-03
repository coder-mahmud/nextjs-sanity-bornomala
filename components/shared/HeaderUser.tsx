"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import Link from "next/link"

export default function LogoutButton() {
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

  if (!session) {
    return (
      <Link
        className="hover:text-primary nav-underline px-2 py-1"
        href="/login"
      >
        Login
      </Link>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <User
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 p-1 rounded-2xl border-2 border-black cursor-pointer"
      />

      {open && (
        <div className="absolute top-[110%] right-0 w-[150px] py-2 bg-black flex flex-col items-center rounded">

          {session?.user?.role === 'USER' ? (
            <Link
              className="text-white px-4 py-2 w-full text-center border-b border-white w-full"
              href="/dashboard"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className="text-white px-4 py-2 w-full text-center border-b border-white w-full"
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
          )}



          <button
            onClick={() =>
              startTransition(async () => {
                await signOut({ redirect: false })
                router.refresh()
                router.push("/login")
              })
            }
            disabled={pending}
            className="px-4 py-2 cursor-pointer text-white "
          >
            {pending ? "Logging out..." : "Logout"}
          </button>


        </div>
      )}
    </div>
  )
}