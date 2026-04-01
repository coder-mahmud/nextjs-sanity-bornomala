import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LoginPageClient from "./login-client"

export default async function LoginPage() {
  const session = await auth()
  // console.log("session from login page:", session)
  if (session?.user) {
    // redirect("/dashboard")
  }

  return <LoginPageClient />
}