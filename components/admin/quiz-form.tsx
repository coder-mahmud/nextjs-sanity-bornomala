"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {toast}  from 'react-toastify'

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

      // console.log("Data at creation phase response:", data)

      if (!res.ok) {
        if(data?.error){
          toast.error(data.error)
        }
        
        throw new Error(data.error || "Failed to save quiz.");
      }

      setMessage(data.message || "Saved successfully.");
      toast.success(data.message)

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
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          {mode === "create" ? "Create Quiz" : "Edit Quiz"}
        </h1>
        <p style={{ color: "#666" }}>
          Single correct answer per question. Slug is auto-generated from title.
        </p>
      </div>

      {message ? (
        <div
          style={{
            background: "#ecfdf3",
            border: "1px solid #86efac",
            color: "#166534",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          background: "#fff",
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label>Title</label>
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
              style={inputStyle}
            />
          </div>

          <div>
            <label>Slug</label>
            {/* <input
              value={titlePreview}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((prev) => ({
                  ...prev,
                  slug: slugify(e.target.value),
                }));
              }}
              placeholder="javascript-fundamentals-exam"
              style={inputStyle}
            /> */}
            <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
              Final slug: <strong>{slugify(form.title)}</strong>
            </p>
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Short description..."
              style={{ ...inputStyle, minHeight: 100 }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <label>Price</label>
              <input
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="19.99"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Currency</label>
              <input
                value={form.currency}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, currency: e.target.value }))
                }
                placeholder="USD"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    durationMinutes: Number(e.target.value),
                  }))
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>Passing Score (%)</label>
              <input
                type="number"
                value={form.passingScore}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    passingScore: Number(e.target.value),
                  }))
                }
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as QuizStatus,
                }))
              }
              style={inputStyle}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                style={primaryButtonStyle}
              >
                + Add Question
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {form.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 16,
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h4 style={{ fontSize: 16, fontWeight: 700 }}>
                      Question {questionIndex + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      style={dangerButtonStyle}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label>Question Text</label>
                      <textarea
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(questionIndex, {
                            text: e.target.value,
                          })
                        }
                        style={{ ...inputStyle, minHeight: 80 }}
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "160px 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label>Marks</label>
                        <input
                          type="number"
                          value={question.marks}
                          onChange={(e) =>
                            updateQuestion(questionIndex, {
                              marks: Number(e.target.value),
                            })
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label>Explanation</label>
                        <input
                          value={question.explanation}
                          onChange={(e) =>
                            updateQuestion(questionIndex, {
                              explanation: e.target.value,
                            })
                          }
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label>Options</label>
                      <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "40px 1fr",
                              gap: 10,
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="radio"
                              checked={option.isCorrect}
                              onChange={() =>
                                setCorrectOption(questionIndex, optionIndex)
                              }
                            />
                            <input
                              value={option.text}
                              onChange={(e) =>
                                updateOption(questionIndex, optionIndex, {
                                  text: e.target.value,
                                })
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              style={inputStyle}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={saving} style={primaryButtonStyle}>
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
              style={secondaryButtonStyle}
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  marginTop: 6,
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #dc2626",
  background: "#fff",
  color: "#dc2626",
  cursor: "pointer",
};