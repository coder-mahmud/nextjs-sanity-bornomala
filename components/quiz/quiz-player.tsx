"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Option = {
  id: string;
  text: string;
  order: number;
};

type Question = {
  id: string;
  text: string;
  order: number;
  options: Option[];
  selectedOptionId: string | null;
};

type AttemptData = {
  id: string;
  startedAt: string;
  status: "STARTED" | "SUBMITTED" | "EVALUATED";
  quiz: {
    id: string;
    title: string;
    durationMinutes: number;
  };
  questions: Question[];
};

export default function QuizPlayer({
  initialData,
}: {
  initialData: AttemptData;
}) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(initialData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();

  const currentQuestion = attempt.questions[currentIndex];

  useEffect(() => {
    const start = new Date(attempt.startedAt).getTime();
    const end = start + attempt.quiz.durationMinutes * 60 * 1000;

    const updateTimer = () => {
      const seconds = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemainingSeconds(seconds);
      if (seconds <= 0) {
        handleSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attempt.startedAt, attempt.quiz.durationMinutes]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [remainingSeconds]);

  async function saveAnswer(questionId: string, selectedOptionId: string) {
    setAttempt((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, selectedOptionId } : q
      ),
    }));

    await fetch(`/api/attempts/${attempt.id}/answer`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, selectedOptionId }),
    });
  }

  async function handleSubmit() {
    startTransition(async () => {
      await fetch(`/api/attempts/${attempt.id}/submit`, {
        method: "POST",
      });

      router.replace(`/quizzes/${attempt.quiz.id}/result/${attempt.id}`);
    });
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{attempt.quiz.title}</h1>
          <div className="rounded-lg border px-4 py-2 font-mono text-lg">
            {formattedTime}
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          Question {currentIndex + 1} of {attempt.questions.length}
        </div>

        <h2 className="mb-6 text-xl font-semibold">{currentQuestion.text}</h2>

        <div className="space-y-3">
          {currentQuestion.options
            .sort((a, b) => a.order - b.order)
            .map((option) => {
              const checked = currentQuestion.selectedOptionId === option.id;

              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                    checked ? "border-black bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    checked={checked}
                    onChange={() => saveAnswer(currentQuestion.id, option.id)}
                    className="mt-1"
                  />
                  <span>{option.text}</span>
                </label>
              );
            })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          {currentIndex < attempt.questions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentIndex((i) => Math.min(attempt.questions.length - 1, i + 1))
              }
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>

      <aside className="rounded-2xl border p-4">
        <h3 className="mb-4 font-semibold">Questions</h3>

        <div className="grid grid-cols-5 gap-2 md:grid-cols-4">
          {attempt.questions.map((q, index) => {
            const answered = !!q.selectedOptionId;
            const active = index === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(index)}
                className={`rounded-lg border p-2 text-sm ${
                  active
                    ? "border-black bg-black text-white"
                    : answered
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}