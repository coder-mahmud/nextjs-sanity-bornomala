import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const genericSuccess = NextResponse.json({
      message:
        "If an account exists with that email, a password reset link has been sent.",
    });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return genericSuccess;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const identifier = `reset:${email}`;
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    // Replace any existing reset token for this email
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({
        where: { identifier },
      }),
      prisma.verificationToken.create({
        data: {
          identifier,
          token: tokenHash,
          expires,
        },
      }),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      email
    )}`;

    await resend.emails.send({
      from: "Echole Bornomala <no-reply@ecolebornomala.com>",
      to: user.email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827;">Reset Your Password</h2>
          <p style="color: #4b5563;">Hi ${user.name || "there"},</p>
          <p style="color: #4b5563;">
            We received a request to reset your password. Click the button below to choose a new password. This link will expire in 30 minutes.
          </p>
          <div style="margin: 28px 0;">
            <a href="${resetUrl}"
              style="background: #3a7867; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return genericSuccess;
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Unable to process request right now." },
      { status: 500 }
    );
  }
}