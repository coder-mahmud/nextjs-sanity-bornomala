// app/api/stripe/checkout/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ==========================================
    // COURSE CHECKOUT
    // ==========================================
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

      const existingAccess = await prisma.courseAccess.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
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

      // Handle 100% Discount Directly
      if (couponResult.finalAmount <= 0) {
        let expiresAt: Date | null = null;
        if (course.isExamCivique) {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          expiresAt = d;
        }

        await prisma.$transaction(async (tx) => {
          // 1. Create a $0 payment record
          const payment = await tx.payment.create({
            data: {
              userId: user.id,
              courseId: course.id,
              provider: "coupon_free",
              amount: 0,
              currency: course.currency || "EUR",
              status: "CAPTURED",
              paidAt: new Date(),
            },
          });

          // 2. Grant Course Access
          await tx.courseAccess.create({
            data: {
              userId: user.id,
              courseId: course.id,
              paymentId: payment.id,
              grantedAt: new Date(),
              expiresAt,
            },
          });

          // 3. Track Coupon Usage
          if (couponResult.couponId && couponResult.couponCode) {
            await tx.coupon.update({
              where: { id: couponResult.couponId },
              data: { usedCount: { increment: 1 } },
            });

            await tx.couponUsage.create({
              data: {
                couponId: couponResult.couponId,
                userId: user.id,
                paymentId: payment.id,
              },
            });
          }
        });

        // 4. Send Confirmation Email via Resend (Matching your webhook template)
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ecolebornomala.com";

          await resend.emails.send({
            from: "Echole Bornomala <no-reply@ecolebornomala.com>",
            to: user.email,
            subject: `Enrollment Confirmed: ${course.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #111827;">Welcome to ${course.title}! 🎉</h2>
                <p style="color: #4b5563;">Hi ${user.name || "Student"},</p>
                <p style="color: #4b5563;">Your 100% discount coupon was applied successfully and your enrollment is confirmed. You can now access all course materials.</p>
                <div style="margin: 30px 0;">
                  <a href="${appUrl}/dashboard/courses/${course.slug}" 
                    style="background: #3a7867; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Go to Course
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
              </div>
            `,
          });

          console.log("Free course confirmation email sent successfully to:", user.email);
        } catch (emailError) {
          console.error("Failed to send free course purchase email:", emailError);
        }

        return NextResponse.json({
          url: `/dashboard/courses/${course.slug}`,
        });
      }
      // Proceed to Stripe Checkout if amount > 0
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: (course.currency || "eur").toLowerCase(),
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

    // ==========================================
    // QUIZ CHECKOUT
    // ==========================================
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

      // Handle 100% Discount Directly for Quizzes
      if (couponResult.finalAmount <= 0) {
        await prisma.$transaction(async (tx) => {
          const payment = await tx.payment.create({
            data: {
              userId: user.id,
              quizId: quiz.id,
              provider: "coupon_free",
              amount: 0,
              currency: quiz.currency || "EUR",
              status: "CAPTURED",
              paidAt: new Date(),
            },
          });

          await tx.quizAccess.create({
            data: {
              userId: user.id,
              quizId: quiz.id,
              paymentId: payment.id,
              grantedAt: new Date(),
            },
          });

          if (couponResult.couponId && couponResult.couponCode) {
            await tx.coupon.update({
              where: { id: couponResult.couponId },
              data: { usedCount: { increment: 1 } },
            });

            await tx.couponUsage.create({
              data: {
                couponId: couponResult.couponId,
                userId: user.id,
                paymentId: payment.id,
              },
            });
          }
        });

        return NextResponse.json({
          url: `/quizzes/${quiz.slug}/start`,
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: quiz.currency.toLowerCase(),
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