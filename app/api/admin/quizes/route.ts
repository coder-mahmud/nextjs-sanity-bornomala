import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

type IncomingOption = {
  text: string;
  isCorrect: boolean;
  order?: number;
};

type IncomingQuestion = {
  text: string;
  explanation?: string | null;
  marks?: number;
  order?: number;
  options: IncomingOption[];
};

type IncomingQuizBody = {
  title: string;
  description?: string | null;
  price: string | number;
  currency?: string;
  durationMinutes: number;
  passingScore: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  questions: IncomingQuestion[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function validateQuizPayload(body: IncomingQuizBody) {
  if (!body.title || !body.title.trim()) {
    return "Title is required.";
  }

  if (!body.durationMinutes || body.durationMinutes <= 0) {
    return "Duration must be greater than 0.";
  }

  if (
    body.passingScore === undefined ||
    body.passingScore === null ||
    body.passingScore < 0 ||
    body.passingScore > 100
  ) {
    return "Passing score must be between 0 and 100.";
  }

  if (!Array.isArray(body.questions) || body.questions.length === 0) {
    return "At least one question is required.";
  }

  for (let i = 0; i < body.questions.length; i++) {
    const question = body.questions[i];

    if (!question.text || !question.text.trim()) {
      return `Question ${i + 1}: text is required.`;
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      return `Question ${i + 1}: at least 2 options are required.`;
    }

    const correctCount = question.options.filter((o) => o.isCorrect).length;

    if (correctCount !== 1) {
      return `Question ${i + 1}: exactly 1 correct option is required.`;
    }

    for (let j = 0; j < question.options.length; j++) {
      const option = question.options[j];
      if (!option.text || !option.text.trim()) {
        return `Question ${i + 1}, Option ${j + 1}: text is required.`;
      }
    }
  }

  return null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
      _count: {
        select: {
          questions: true,
          attempts: true,
          accesses: true,
          payments: true,
        },
      },
    },
  });

  return NextResponse.json({ quizzes });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  try {
    const body = (await request.json()) as IncomingQuizBody;

    const validationError = validateQuizPayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const generatedSlug = slugify(body.title);

    const existing = await prisma.quiz.findUnique({
      where: { slug: generatedSlug },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A quiz with this title already exists. Please change the title." },
        { status: 409 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: body.title.trim(),
        slug: generatedSlug,
        description: body.description?.trim() || null,
        price: body.price.toString(),
        currency: body.currency || "USD",
        durationMinutes: Number(body.durationMinutes),
        passingScore: Number(body.passingScore),
        status: body.status || "DRAFT",
        questions: {
          create: body.questions.map((question, qIndex) => ({
            text: question.text.trim(),
            explanation: question.explanation?.trim() || null,
            marks: Number(question.marks ?? 1),
            order: Number(question.order ?? qIndex + 1),
            options: {
              create: question.options.map((option, oIndex) => ({
                text: option.text.trim(),
                isCorrect: Boolean(option.isCorrect),
                order: Number(option.order ?? oIndex + 1),
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Quiz created successfully.", quiz },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/quizzes error:", error);
    return NextResponse.json(
      { error: "Failed to create quiz." },
      { status: 500 }
    );
  }
}