// app/api/stripe/checkout/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

type CouponResult = {
  couponId: string | null;
  couponCode: string | null;
  originalAmount: number;
  finalAmount: number;
  discountAmount: number;
};

function calculateFinalAmount({
  originalAmount,
  couponType,
  couponValue,
}: {
  originalAmount: number;
  couponType: "PERCENT" | "FIXED";
  couponValue: number;
}) {
  if (couponType === "PERCENT") {
    const discount = originalAmount * (couponValue / 100);
    return Math.max(0, originalAmount - discount);
  }

  return Math.max(0, originalAmount - couponValue);
}

async function applyCoupon({
  couponCode,
  originalAmount,
  courseId,
  quizId,
}: {
  couponCode?: string;
  originalAmount: number;
  courseId?: string;
  quizId?: string;
}): Promise<CouponResult> {
  if (!couponCode || couponCode.trim() === "") {
    return {
      couponId: null,
      couponCode: null,
      originalAmount,
      finalAmount: originalAmount,
      discountAmount: 0,
    };
  }

  const normalizedCode = couponCode.trim().toUpperCase();

  const coupon = await prisma.coupon.findUnique({
    where: {
      code: normalizedCode,
    },
  });

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (!coupon.active) {
    throw new Error("This coupon is not active");
  }

  const now = new Date();

  if (coupon.startsAt && coupon.startsAt > now) {
    throw new Error("This coupon is not active yet");
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new Error("This coupon has expired");
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new Error("This coupon has reached its usage limit");
  }

  if (coupon.courseId && coupon.courseId !== courseId) {
    throw new Error("This coupon is not valid for this course");
  }

  if (coupon.quizId && coupon.quizId !== quizId) {
    throw new Error("This coupon is not valid for this quiz");
  }

  const finalAmount = calculateFinalAmount({
    originalAmount,
    couponType: coupon.type,
    couponValue: Number(coupon.value),
  });

  return {
    couponId: coupon.id,
    couponCode: coupon.code,
    originalAmount,
    finalAmount,
    discountAmount: originalAmount - finalAmount,
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { courseId, quizId, couponCode } = body;

    if (!courseId && !quizId) {
      return NextResponse.json(
        { error: "courseId or quizId is required" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      const existingAccess = await prisma.courseAccess.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
      });

      if (existingAccess) {
        return NextResponse.json({
          url: `/dashboard/courses/${course.slug}`,
        });
      }

      const couponResult = await applyCoupon({
        couponCode,
        originalAmount: Number(course.price),
        courseId: course.id,
      });

      if (couponResult.finalAmount <= 0) {
        return NextResponse.json(
          { error: "100% discount coupons are not supported yet" },
          { status: 400 }
        );
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: course.currency,
              product_data: {
                name: course.title,
              },
              unit_amount: Math.round(couponResult.finalAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/payment/success?course=${course.slug}`,
        cancel_url: `${baseUrl}/payment/failed?cancel=1`,
        metadata: {
          type: "course",
          courseId: course.id,
          couponId: couponResult.couponId || "",
          couponCode: couponResult.couponCode || "",
          originalAmount: couponResult.originalAmount.toString(),
          finalAmount: couponResult.finalAmount.toString(),
          discountAmount: couponResult.discountAmount.toString(),
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    if (quizId) {
      const quiz = await prisma.quiz.findUnique({
        where: {
          id: quizId,
        },
      });

      if (!quiz) {
        return NextResponse.json(
          { error: "Quiz not found" },
          { status: 404 }
        );
      }

      const existingAccess = await prisma.quizAccess.findUnique({
        where: {
          userId_quizId: {
            userId: user.id,
            quizId: quiz.id,
          },
        },
      });

      if (existingAccess) {
        return NextResponse.json({
          url: `/quizzes/${quiz.slug}/start`,
        });
      }

      const couponResult = await applyCoupon({
        couponCode,
        originalAmount: Number(quiz.price),
        quizId: quiz.id,
      });

      if (couponResult.finalAmount <= 0) {
        return NextResponse.json(
          { error: "100% discount coupons are not supported yet" },
          { status: 400 }
        );
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: quiz.currency,
              product_data: {
                name: quiz.title,
              },
              unit_amount: Math.round(couponResult.finalAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/payment/success?quiz=${quiz.slug}`,
        cancel_url: `${baseUrl}/payment/failed?cancel=1`,
        metadata: {
          type: "quiz",
          quizId: quiz.id,
          couponId: couponResult.couponId || "",
          couponCode: couponResult.couponCode || "",
          originalAmount: couponResult.originalAmount.toString(),
          finalAmount: couponResult.finalAmount.toString(),
          discountAmount: couponResult.discountAmount.toString(),
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    return NextResponse.json(
      { error: "Invalid checkout request" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Stripe checkout error:", err);

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}