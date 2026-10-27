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
  courseSlug,
  lessonSlug,
  quizSlug,
}: {
  initialData: AttemptData;
  courseSlug: string;
  lessonSlug: string;
  quizSlug: string;
}) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(initialData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();

  const currentQuestion = attempt.questions[currentIndex];
  const totalQuestions = attempt.questions.length;
  const answeredCount = attempt.questions.filter((q) => q.selectedOptionId !== null).length;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

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

  const isLowTime = remainingSeconds < 60; // Under 1 minute left

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

      router.replace(
        `/dashboard/courses/${courseSlug}/lessons/${lessonSlug}/quiz/${quizSlug}/result/${attempt.id}?lessonsSlug=${lessonSlug}`
      );
    });
  }

  return (
    <div className="mx-auto min-h-[85vh] max-w-7xl px-4 py-8">
      {/* Top Header Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <span className="inline-flex rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700">
            Assessment in Progress
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {attempt.quiz.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-400">Time Remaining</p>
            <p className="text-xs font-semibold text-slate-700">{answeredCount} of {totalQuestions} answered</p>
          </div>
          <div className={`flex items-center gap-2 rounded-2xl border px-5 py-3 font-mono text-xl font-bold shadow-xs transition-colors ${
            isLowTime 
              ? "border-red-300 bg-red-50 text-red-600 animate-pulse" 
              : "border-slate-200 bg-slate-50 text-slate-800"
          }`}>
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        
        {/* Left Card: Question and Options Panel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col justify-between">
          <div>
            {/* Progress Bar & Question Counter */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider uppercase text-indigo-600">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {progressPercentage}% Completed
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-bold leading-snug text-slate-900 mb-8">
              {currentQuestion.text}
            </h2>

            {/* Answer Options Container */}
            <div className="space-y-4">
              {currentQuestion.options
                .sort((a, b) => a.order - b.order)
                .map((option, idx) => {
                  const checked = currentQuestion.selectedOptionId === option.id;
                  const optionLetters = ["A", "B", "C", "D", "E", "F"];

                  return (
                    <div
                      key={option.id}
                      onClick={() => saveAnswer(currentQuestion.id, option.id)}
                      className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition-all ${
                        checked
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      {/* Option Badge */}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                        checked 
                          ? "bg-indigo-600 text-white" 
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}>
                        {optionLetters[idx] || idx + 1}
                      </div>

                      {/* Option Text */}
                      <span className={`text-sm sm:text-base font-medium flex-1 ${checked ? "text-indigo-950 font-semibold" : "text-slate-700"}`}>
                        {option.text}
                      </span>

                      {/* Custom Radio Check Indicator */}
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                        checked ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
                      }`}>
                        {checked && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Navigation Controls Footer */}
          <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() =>
                  setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs"
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs"
              >
                {isPending ? "Submitting..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Question Palette & Navigation Map */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Question Navigator</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any number to jump directly</p>
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {attempt.questions.map((q, index) => {
              const answered = !!q.selectedOptionId;
              const active = index === currentIndex;

              let btnStyles = "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";
              if (active) {
                btnStyles = "border-indigo-600 bg-indigo-600 text-white font-bold ring-2 ring-indigo-600/20 shadow-xs";
              } else if (answered) {
                btnStyles = "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-11 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center ${btnStyles}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="border-t border-slate-100 pt-5 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <div className="h-3.5 w-3.5 rounded-lg border border-indigo-600 bg-indigo-600" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-3.5 w-3.5 rounded-lg border border-emerald-300 bg-emerald-50" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-3.5 w-3.5 rounded-lg border border-slate-200 bg-slate-50" />
              <span>Unanswered</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}