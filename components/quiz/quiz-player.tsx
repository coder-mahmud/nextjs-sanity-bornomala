"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Grid, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const isLowTime = remainingSeconds < 60;

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

  const NavigatorContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Question Navigator</h3>
          <p className="text-xs text-slate-400 mt-0.5">Jump directly to any question</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(false)} 
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto p-1">
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
              onClick={() => {
                setCurrentIndex(index);
                setIsDrawerOpen(false);
              }}
              className={`h-10 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center ${btnStyles}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md border border-indigo-600 bg-indigo-600" />
          <span>Current Question</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md border border-emerald-300 bg-emerald-50" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md border border-slate-200 bg-slate-50" />
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto min-h-[90vh] max-w-[1400px] px-2 sm:px-6 py-4 sm:py-6">
      {/* Top Header Bar */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-4 sm:px-8 py-4 shadow-xs">
        <div>
          <span className="inline-flex rounded-full bg-indigo-50 border border-indigo-200 px-3 py-0.5 text-xs font-semibold text-indigo-700">
            Assessment in Progress
          </span>
          <h1 className="mt-1.5 text-lg sm:text-2xl font-bold tracking-tight text-slate-900 line-clamp-1">
            {attempt.quiz.title}
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="text-left sm:text-right">
            <p className="text-[11px] font-medium text-slate-400">Time Remaining</p>
            <p className="text-xs font-semibold text-slate-700">{answeredCount} of {totalQuestions} answered</p>
          </div>
          
          <div className={`flex items-center gap-2 rounded-xl border px-3 sm:px-4 py-2 font-mono text-base sm:text-lg font-bold shadow-xs transition-colors ${
            isLowTime 
              ? "border-red-300 bg-red-50 text-red-600 animate-pulse" 
              : "border-slate-200 bg-slate-50 text-slate-800"
          }`}>
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            {formattedTime}
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden flex items-center justify-center rounded-xl border border-slate-200 bg-slate-900 text-white p-2.5 shadow-xs hover:bg-slate-800 transition"
            title="Open Question Navigator"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Content - Expanded Width */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        
        {/* Left Card: Question and Options Panel */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:px-10 sm:py-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wider uppercase text-indigo-600">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {progressPercentage}% Completed
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-1.5 rounded-full mb-5 sm:mb-6 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <h2 className="text-base sm:text-xl font-bold leading-snug text-slate-900 mb-5 sm:mb-6">
              {currentQuestion.text}
            </h2>

            {/* Answer Options Container */}
            <div className="space-y-2.5 sm:space-y-3">
              {currentQuestion.options
                .sort((a, b) => a.order - b.order)
                .map((option, idx) => {
                  const checked = currentQuestion.selectedOptionId === option.id;
                  const shortLetters = ["A", "B", "C", "D", "E", "F"];

                  return (
                    <div
                      key={option.id}
                      onClick={() => saveAnswer(currentQuestion.id, option.id)}
                      className={`group flex flex-col cursor-pointer rounded-xl border px-4 py-3 sm:px-5 sm:py-3.5 transition-all ${
                        checked
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      {/* Option Letter Row */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase transition-colors ${
                          checked 
                            ? "bg-indigo-600 text-white" 
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}>
                          {shortLetters[idx] || idx + 1}
                        </div>
                      </div>

                      {/* Option Answer Text Row */}
                      <span className={`text-xs sm:text-sm font-medium pl-0.5 ${checked ? "text-indigo-950 font-semibold" : "text-slate-700"}`}>
                        {option.text}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Navigation Controls Footer */}
          <div className="mt-6 sm:mt-8 flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() =>
                  setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
                }
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs"
              >
                {isPending ? "Submitting..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Question Palette */}
        <aside className="hidden lg:block h-fit rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <NavigatorContent />
        </aside>

      </div>

      {/* Mobile Bottom Drawer for Question Navigator */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end bg-slate-900/50 backdrop-blur-xs transition-opacity">
          <div className="w-full bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            <NavigatorContent />
          </div>
        </div>
      )}
    </div>
  );
}