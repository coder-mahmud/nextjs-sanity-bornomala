// app/api/admin/coupons/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "SUPERADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      id,
      code,
      type,
      value,
      active,
      maxUses,
      startsAt,
      expiresAt,
      courseId,
      quizId,
    } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!["PERCENT", "FIXED"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid coupon type" },
        { status: 400 }
      );
    }

    if (value === undefined || value === null || value === "") {
      return NextResponse.json(
        { error: "Coupon value is required" },
        { status: 400 }
      );
    }

    const valueString = String(value).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(valueString)) {
      return NextResponse.json(
        { error: "Coupon value must be a valid number with up to 2 decimals" },
        { status: 400 }
      );
    }

    const valueNumber = Number(valueString);

    if (Number.isNaN(valueNumber) || valueNumber <= 0) {
      return NextResponse.json(
        { error: "Coupon value must be greater than 0" },
        { status: 400 }
      );
    }

    if (type === "PERCENT" && valueNumber > 100) {
      return NextResponse.json(
        { error: "Percent coupon value cannot be greater than 100" },
        { status: 400 }
      );
    }

    const parsedMaxUses =
      maxUses === "" || maxUses === null || maxUses === undefined
        ? null
        : Number(maxUses);

    if (
      parsedMaxUses !== null &&
      (!Number.isInteger(parsedMaxUses) || parsedMaxUses < 1)
    ) {
      return NextResponse.json(
        { error: "Max uses must be a positive whole number" },
        { status: 400 }
      );
    }

    const parsedStartsAt = startsAt ? new Date(startsAt) : null;
    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;

    if (parsedStartsAt && Number.isNaN(parsedStartsAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid start date" },
        { status: 400 }
      );
    }

    if (parsedExpiresAt && Number.isNaN(parsedExpiresAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid expiry date" },
        { status: 400 }
      );
    }

    if (
      parsedStartsAt &&
      parsedExpiresAt &&
      parsedExpiresAt <= parsedStartsAt
    ) {
      return NextResponse.json(
        { error: "Expiry date must be after start date" },
        { status: 400 }
      );
    }

    const parsedCourseId =
      typeof courseId === "string" && courseId.trim() !== ""
        ? courseId.trim()
        : null;

    const parsedQuizId =
      typeof quizId === "string" && quizId.trim() !== ""
        ? quizId.trim()
        : null;

    if (parsedCourseId && parsedQuizId) {
      return NextResponse.json(
        { error: "Select either a course or a quiz, not both" },
        { status: 400 }
      );
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
      select: {
        id: true,
        usedCount: true,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    if (
      parsedMaxUses !== null &&
      parsedMaxUses < existingCoupon.usedCount
    ) {
      return NextResponse.json(
        {
          error: `Max uses cannot be less than current used count (${existingCoupon.usedCount})`,
        },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: valueString,
        active: active === true,
        maxUses: parsedMaxUses,
        startsAt: parsedStartsAt,
        expiresAt: parsedExpiresAt,
        courseId: parsedCourseId,
        quizId: parsedQuizId,
      },
    });

    return NextResponse.json({
      success: true,
      coupon: {
        ...coupon,
        value: coupon.value.toFixed(2),
        createdAt: coupon.createdAt.toISOString(),
        updatedAt: coupon.updatedAt.toISOString(),
        startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
      },
    });
  } catch (error: any) {
    console.error("Coupon update error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Coupon code must be unique" },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}