"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { Resend } from "resend"


const resend = new Resend(process.env.RESEND_API_KEY)

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
})

export async function registerAction(values: unknown) {
  const parsed = registerSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message,
    }
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { ok: false, error: "User already exists" }
  }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { name, email, password: hashed },
  })

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    await resend.emails.send({
      from: "Welcome <no-reply@ecolebornomala.com>",
      to: email,
      // to: 'bornomalaecole@gmail.com',
      subject: "Welcome to Our Platform! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827;">Welcome aboard, ${name}! 👋</h2>
          <p style="color: #4b5563;">Thank you for creating an account with us. We're thrilled to have you.</p>
          <p style="color: #4b5563;">You can now log in to explore your dashboard, browse available courses, and start learning.</p>
          <div style="margin: 30px 0;">
            <a href="${appUrl}/login" 
               style="background: #000000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">If you didn't create this account, please feel free to ignore this email.</p>
        </div>
      `,
    })

    console.log("Welcome email sent successfully to:", email)
  } catch (emailError) {
    // Note: Registration still succeeds even if email fails, 
    // but logging the error helps with debugging.
    console.error("Failed to send welcome email:", emailError)
  }


  return { ok: true }
}