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

function getStatusClasses(status: QuizStatus) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage, review, and organize all quizzes from one place.
        </p>

        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              placeholder="Search by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:max-w-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={loadQuizzes}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>

              <Link
                href="/admin/quizes/new"
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                + Create New Quiz
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading quizzes...</p>
          ) : filteredQuizzes.length === 0 ? (
            <p className="text-sm text-gray-500">No quizzes found.</p>
          ) : (
            <div className="grid gap-4">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="rounded-2xl border border-gray-200 p-5"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                        quiz.status
                      )}`}
                    >
                      {quiz.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      Created {formatDate(quiz.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {quiz.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">/{quiz.slug}</p>
                  <p className="mt-3 text-sm text-gray-600">
                    {quiz.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>
                      Price: {quiz.currency} {quiz.price}
                    </span>
                    <span>Duration: {quiz.durationMinutes} min</span>
                    <span>Pass Score: {quiz.passingScore}%</span>
                    <span>
                      Questions: {quiz._count?.questions ?? quiz.questions.length}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/admin/quizes/${quiz.id}`}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}