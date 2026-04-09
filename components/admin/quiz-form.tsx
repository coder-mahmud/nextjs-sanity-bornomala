"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type QuestionOption = {
  text: string;
  isCorrect: boolean;
  order: number;
};

type Question = {
  text: string;
  explanation: string;
  marks: number;
  order: number;
  options: QuestionOption[];
};

type QuizFormValues = {
  title: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  durationMinutes: number;
  passingScore: number;
  status: QuizStatus;
  questions: Question[];
};

type QuizFormProps = {
  mode: "create" | "edit";
  quizId?: string;
  initialValues?: QuizFormValues;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function emptyQuestion(order = 1): Question {
  return {
    text: "",
    explanation: "",
    marks: 1,
    order,
    options: [
      { text: "", isCorrect: true, order: 1 },
      { text: "", isCorrect: false, order: 2 },
      { text: "", isCorrect: false, order: 3 },
      { text: "", isCorrect: false, order: 4 },
    ],
  };
}

function emptyForm(): QuizFormValues {
  return {
    title: "",
    slug: "",
    description: "",
    price: "0.00",
    currency: "USD",
    durationMinutes: 30,
    passingScore: 70,
    status: "DRAFT",
    questions: [emptyQuestion(1)],
  };
}

function getStatusBadge(status: QuizStatus) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200";
    case "DRAFT":
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }
}

export default function QuizForm({
  mode,
  quizId,
  initialValues,
}: QuizFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<QuizFormValues>(
    initialValues ?? emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));

  const titlePreview = useMemo(() => {
    return form.slug || slugify(form.title);
  }, [form.slug, form.title]);

  function addQuestion() {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion(prev.questions.length + 1)],
    }));
  }

  function removeQuestion(index: number) {
    setForm((prev) => {
      const questions = prev.questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i + 1 }));

      return {
        ...prev,
        questions: questions.length ? questions : [emptyQuestion(1)],
      };
    });
  }

  function updateQuestion(index: number, patch: Partial<Question>) {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === index ? { ...question, ...patch } : question
      ),
    }));
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    patch: Partial<QuestionOption>
  ) {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, qi) => {
        if (qi !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, oi) =>
            oi === optionIndex ? { ...option, ...patch } : option
          ),
        };
      }),
    }));
  }

  function setCorrectOption(questionIndex: number, optionIndex: number) {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, qi) => {
        if (qi !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, oi) => ({
            ...option,
            isCorrect: oi === optionIndex,
          })),
        };
      }),
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        slug: slugify(form.title),
        questions: form.questions.map((question, qIndex) => ({
          ...question,
          order: qIndex + 1,
          options: question.options.map((option, oIndex) => ({
            ...option,
            order: oIndex + 1,
          })),
        })),
      };

      const endpoint =
        mode === "create"
          ? "/api/admin/quizes"
          : `/api/admin/quizes/${quizId}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error) {
          toast.error(data.error);
        }

        throw new Error(data.error || "Failed to save quiz.");
      }

      setMessage(data.message || "Saved successfully.");
      toast.success(data.message || "Saved successfully.");

      if (mode === "create") {
        router.push("/admin/quizes");
        router.refresh();
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Admin / Quizzes</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              {mode === "create" ? "Create Quiz" : "Edit Quiz"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Create a structured quiz with one correct answer per question.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                form.status
              )}`}
            >
              {form.status}
            </span>
          </div>
        </div>

        {message ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Quiz Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Basic settings and configuration for this quiz.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="grid gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title: newTitle,
                        slug: slugTouched ? prev.slug : slugify(newTitle),
                      }));
                    }}
                    placeholder="JavaScript Fundamentals Exam"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm font-medium text-gray-700">Slug Preview</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Final slug:{" "}
                    <span className="font-semibold text-gray-900">
                      {slugify(form.title) || "your-quiz-slug"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Short description..."
                    className="min-h-[120px] w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      placeholder="19.99"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <input
                      value={form.currency}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          currency: e.target.value,
                        }))
                      }
                      placeholder="USD"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={form.durationMinutes}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          durationMinutes: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={form.passingScore}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          passingScore: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as QuizStatus,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Questions
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Add questions and mark one correct option for each.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  + Add Question
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {form.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5"
                >
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Question {questionIndex + 1}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Configure the question text, explanation, marks, and options.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Question Text
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(questionIndex, {
                            text: e.target.value,
                          })
                        }
                        className="min-h-[100px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Enter the question..."
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Marks
                        </label>
                        <input
                          type="number"
                          value={question.marks}
                          onChange={(e) =>
                            updateQuestion(questionIndex, {
                              marks: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Explanation
                        </label>
                        <input
                          value={question.explanation}
                          onChange={(e) =>
                            updateQuestion(questionIndex, {
                              explanation: e.target.value,
                            })
                          }
                          placeholder="Optional explanation for the correct answer"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-700">
                        Options
                      </label>

                      <div className="grid gap-3">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition ${
                              option.isCorrect
                                ? "border-emerald-300 ring-2 ring-emerald-100"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              checked={option.isCorrect}
                              onChange={() =>
                                setCorrectOption(questionIndex, optionIndex)
                              }
                              className="h-4 w-4"
                            />

                            <div className="flex-1">
                              <input
                                value={option.text}
                                onChange={(e) =>
                                  updateOption(questionIndex, optionIndex, {
                                    text: e.target.value,
                                  })
                                }
                                placeholder={`Option ${optionIndex + 1}`}
                                className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                              />
                            </div>

                            {option.isCorrect ? (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                Correct
                              </span>
                            ) : null}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Quiz"
                : "Update Quiz"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/quizes")}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back to Quizzes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}