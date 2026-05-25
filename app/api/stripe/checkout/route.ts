// app/api/stripe/checkout/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

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
    const { courseId, quizId } = body;

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
              unit_amount: Math.round(Number(course.price) * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/payment/success?course=${course.slug}`,
        cancel_url: `${baseUrl}/payment/failed?cancel=1`,
        metadata: {
          type: "course",
          courseId: course.id,
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
              unit_amount: Math.round(Number(quiz.price) * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/payment/success?course=${quiz.slug}`,
        cancel_url: `${baseUrl}/payment/failed?cancel=1`,
        metadata: {
          type: "quiz",
          quizId: quiz.id,
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