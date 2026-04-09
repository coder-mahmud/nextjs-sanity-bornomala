"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type QuizRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  currency: string;
  durationMinutes: number;
  passingScore: number;
  createdAt: string;
  _count?: {
    questions: number;
  };
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export default function PublicQuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadQuizzes() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/quizzes", { cache: "no-store" });
      const data = await res.json();
      console.log("quiz data:", data);

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
    const q = search.toLowerCase().trim();

    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(q) ||
        quiz.slug.toLowerCase().includes(q)
    );
  }, [quizzes, search]);

  return (
    <section className="bg-gradient-to-b from-slate-50 via-white to-slate-100 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur md:p-10">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                Explore Quiz Collection
              </span>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Discover and take the quizzes that match your goals
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
                Browse all available quizzes, review key information, and open
                the full details page for each one.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {quizzes.length} Total Quizzes
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Public Access
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Easy Search
                </span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          ) : null}

          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Available Quizzes
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search by quiz title or slug to find what you need quickly.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search quizzes by title or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 md:w-80"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
                  <div className="mt-5 space-y-2">
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-5/6 rounded bg-slate-200" />
                    <div className="h-4 w-4/6 rounded bg-slate-200" />
                  </div>
                  <div className="mt-6 h-11 w-36 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto max-w-md">
                <h3 className="text-xl font-semibold text-slate-900">
                  No quizzes found
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  We could not find any quizzes matching your search. Try a
                  different keyword or clear the search input.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {quiz._count?.questions ?? 0} Questions
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(quiz.createdAt)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-primary">
                      {quiz.title}
                    </h3>

                    {/* <p className="mt-2 text-sm text-slate-500">/{quiz.slug}</p> */}

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {quiz.description
                        ? truncateText(quiz.description, 120)
                        : "No description provided for this quiz yet."}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Price
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {quiz.currency} {quiz.price}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Duration
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {quiz.durationMinutes} min
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Passing Score
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {quiz.passingScore}%
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Level
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          Professional
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      href={`/quizzes/${quiz.slug}`}
                      className="inline-flex items-center justify-center bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors "
                    >
                      Show Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}