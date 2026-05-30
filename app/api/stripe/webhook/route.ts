// app/api/stripe/webhook/route.ts

import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);

    return NextResponse.json(
      { received: false },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const courseId = session.metadata?.courseId;
    const quizId = session.metadata?.quizId;

    const couponId = session.metadata?.couponId || null;
    const couponCode = session.metadata?.couponCode || null;

    const userEmail = session.customer_email;

    const stripeSessionId = session.id;

    const stripeIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    const finalAmount = Number(session.metadata?.finalAmount || 0);

    if (!userEmail) {
      console.error("Missing userEmail");

      return NextResponse.json({ received: true });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      console.error("User not found:", userEmail);

      return NextResponse.json({ received: true });
    }

    // COURSE PAYMENT
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        console.error("Course not found:", courseId);

        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.upsert({
          where: {
            stripeSessionId,
          },
          update: {
            status: "CAPTURED",
            paidAt: new Date(),
            rawResponse: session as any,
          },
          create: {
            userId: user.id,
            courseId: course.id,
            provider: "stripe",
            stripeSessionId,
            stripeIntentId,
            amount: finalAmount || Number(course.price),
            currency: course.currency,
            status: "CAPTURED",
            paidAt: new Date(),
            rawResponse: session as any,
          },
        });

        await tx.courseAccess.upsert({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id,
            },
          },
          update: {
            paymentId: payment.id,
            grantedAt: new Date(),
          },
          create: {
            userId: user.id,
            courseId: course.id,
            paymentId: payment.id,
            grantedAt: new Date(),
          },
        });

        // COUPON TRACKING
        if (couponId && couponCode) {
          await tx.coupon.update({
            where: {
              id: couponId,
            },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });

          await tx.couponUsage.create({
            data: {
              couponId,
              userId: user.id,
              paymentId: payment.id,
            },
          });
        }
      });

      console.log("Course access granted:", {
        userEmail,
        courseId,
        stripeSessionId,
        couponCode,
      });
    }

    // QUIZ PAYMENT
    if (quizId) {
      const quiz = await prisma.quiz.findUnique({
        where: {
          id: quizId,
        },
      });

      if (!quiz) {
        console.error("Quiz not found:", quizId);

        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.upsert({
          where: {
            stripeSessionId,
          },
          update: {
            status: "CAPTURED",
            paidAt: new Date(),
            rawResponse: session as any,
          },
          create: {
            userId: user.id,
            quizId: quiz.id,
            provider: "stripe",
            stripeSessionId,
            stripeIntentId,
            amount: finalAmount || Number(quiz.price),
            currency: quiz.currency,
            status: "CAPTURED",
            paidAt: new Date(),
            rawResponse: session as any,
          },
        });

        await tx.quizAccess.upsert({
          where: {
            userId_quizId: {
              userId: user.id,
              quizId: quiz.id,
            },
          },
          update: {
            paymentId: payment.id,
            grantedAt: new Date(),
          },
          create: {
            userId: user.id,
            quizId: quiz.id,
            paymentId: payment.id,
            grantedAt: new Date(),
          },
        });

        // COUPON TRACKING
        if (couponId && couponCode) {
          await tx.coupon.update({
            where: {
              id: couponId,
            },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });

          await tx.couponUsage.create({
            data: {
              couponId,
              userId: user.id,
              paymentId: payment.id,
            },
          });
        }
      });

      console.log("Quiz access granted:", {
        userEmail,
        quizId,
        stripeSessionId,
        couponCode,
      });
    }
  }

  return NextResponse.json({ received: true });
}