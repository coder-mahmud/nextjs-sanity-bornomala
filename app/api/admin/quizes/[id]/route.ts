import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
  slug: string;
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

  if (!body.slug || !body.slug.trim()) {
    return "Slug is required.";
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

export async function GET(_: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  const { id } = await context.params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
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
          attempts: true,
          accesses: true,
          payments: true,
          questions: true,
        },
      },
    },
  });

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  return NextResponse.json({ quiz });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as IncomingQuizBody;

    body.slug = slugify(body.slug || body.title);

    const validationError = validateQuizPayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    const duplicateSlug = await prisma.quiz.findFirst({
      where: {
        slug: body.slug,
        NOT: { id },
      },
      select: { id: true },
    });

    if (duplicateSlug) {
      return NextResponse.json(
        { error: "Another quiz already uses this slug." },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.quiz.update({
        where: { id },
        data: {
          title: body.title.trim(),
          slug: body.slug,
          description: body.description?.trim() || null,
          price: body.price.toString(),
          currency: body.currency || "USD",
          durationMinutes: Number(body.durationMinutes),
          passingScore: Number(body.passingScore),
          status: body.status || "DRAFT",
        },
      });

      const existingQuestions = await tx.question.findMany({
        where: { quizId: id },
        select: { id: true },
      });

      const existingQuestionIds = existingQuestions.map((q) => q.id);

      if (existingQuestionIds.length > 0) {
        await tx.quizAttemptAnswer.deleteMany({
          where: {
            questionId: { in: existingQuestionIds },
          },
        });

        await tx.questionOption.deleteMany({
          where: {
            questionId: { in: existingQuestionIds },
          },
        });

        await tx.question.deleteMany({
          where: { quizId: id },
        });
      }

      await tx.question.createMany({
        data: body.questions.map((question, qIndex) => ({
          quizId: id,
          text: question.text.trim(),
          explanation: question.explanation?.trim() || null,
          marks: Number(question.marks ?? 1),
          order: Number(question.order ?? qIndex + 1),
        })),
      });

      const createdQuestions = await tx.question.findMany({
        where: { quizId: id },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      });

      const optionRows: Array<{
        questionId: string;
        text: string;
        isCorrect: boolean;
        order: number;
      }> = [];

      for (let qIndex = 0; qIndex < body.questions.length; qIndex++) {
        const inputQuestion = body.questions[qIndex];
        const createdQuestion = createdQuestions.find(
          (q) => q.order === Number(inputQuestion.order ?? qIndex + 1)
        );

        if (!createdQuestion) continue;

        for (let oIndex = 0; oIndex < inputQuestion.options.length; oIndex++) {
          const option = inputQuestion.options[oIndex];
          optionRows.push({
            questionId: createdQuestion.id,
            text: option.text.trim(),
            isCorrect: Boolean(option.isCorrect),
            order: Number(option.order ?? oIndex + 1),
          });
        }
      }

      if (optionRows.length > 0) {
        await tx.questionOption.createMany({
          data: optionRows,
        });
      }
    });

    const updatedQuiz = await prisma.quiz.findUnique({
      where: { id },
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

    return NextResponse.json({
      message: "Quiz updated successfully.",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("PATCH /api/admin/quizzes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update quiz." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  const { id } = await context.params;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Quiz deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/admin/quizzes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz." },
      { status: 500 }
    );
  }
}