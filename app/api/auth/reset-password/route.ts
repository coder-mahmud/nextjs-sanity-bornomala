import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const identifier = `reset:${email}`;
    const tokenHash = hashToken(parsed.data.token);

    const record = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier,
          token: tokenHash,
        },
      },
    });

    if (!record || record.expires < new Date()) {
      if (record) {
        await prisma.verificationToken.deleteMany({ where: { identifier } });
      }
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier },
      }),
    ]);

    return NextResponse.json({
      message: "Your password has been reset successfully. You can now sign in.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}