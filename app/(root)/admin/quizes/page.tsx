"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type QuizRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  currency: string;
  durationMinutes: number;
  passingScore: number;
  status: QuizStatus;
  createdAt: string;
  questions: Array<{
    id: string;
    text: string;
  }>;
  _count?: {
    questions: number;
    attempts: number;
    accesses: number;
    payments: number;
  };
};

export default function AdminQuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadQuizzes() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/quizes", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load quizzes.");
      }

      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuizzes();
  }, []);

  const filteredQuizzes = useMemo(() => {
    const q = search.toLowerCase();
    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(q) ||
        quiz.slug.toLowerCase().includes(q)
    );
  }, [quizzes, search]);

  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this quiz?");
    if (!ok) return;

    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/quizes/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete quiz.");
      }

      setMessage(data.message || "Quiz deleted.");
      await loadQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quiz.");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Quizzes
          </h1>
          <p style={{ color: "#666" }}>
            Quiz landing page with all quizzes.
          </p>
        </div>

        <Link href="/admin/quizes/new" style={primaryButtonStyle}>
          + Create New Quiz
        </Link>
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

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>All Quizzes</h2>
          <button onClick={loadQuizzes} style={secondaryButtonStyle}>
            Refresh
          </button>
        </div>

        <input
          placeholder="Search by title or slug"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, marginBottom: 16 }}
        />

        {loading ? (
          <p>Loading quizzes...</p>
        ) : filteredQuizzes.length === 0 ? (
          <p>No quizzes found.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                      {quiz.title}
                    </h3>
                    <p style={{ color: "#666", marginBottom: 6 }}>
                      /{quiz.slug}
                    </p>
                    <p style={{ color: "#444", marginBottom: 8 }}>
                      {quiz.description || "No description"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        fontSize: 14,
                        color: "#555",
                      }}
                    >
                      <span>Status: {quiz.status}</span>
                      <span>
                        Price: {quiz.currency} {quiz.price}
                      </span>
                      <span>Duration: {quiz.durationMinutes} min</span>
                      <span>Pass: {quiz.passingScore}%</span>
                      <span>
                        Questions: {quiz._count?.questions ?? quiz.questions.length}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/admin/quizes/${quiz.id}`}
                      style={secondaryButtonStyle}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      style={dangerButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  display: "inline-block",
  textDecoration: "none",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
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