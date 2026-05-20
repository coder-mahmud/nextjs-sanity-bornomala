"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

type ActionState = {
  status: "success" | "error";
  message: string;
} | null;

type EditLessonFormProps = {
  action: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  title: string;
  description: string;
  durationSeconds: number | null;
  bunnyLibraryId: string;
  bunnyVideoId: string;
  isPreview: boolean;
};

const EditLessonForm = ({
  action,
  title,
  description,
  durationSeconds,
  bunnyLibraryId,
  bunnyVideoId,
  isPreview,
}: EditLessonFormProps) => {
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (!state?.message) return;

    if (state.status === "success") {
      toast.success(state.message);
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Lesson Title *
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={title}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Duration Seconds
          </label>
          <input
            type="number"
            name="durationSeconds"
            defaultValue={durationSeconds ?? ""}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="300"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bunny Library ID
          </label>
          <input
            type="text"
            name="bunnyLibraryId"
            defaultValue={bunnyLibraryId}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="666089"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bunny Video ID *
          </label>
          <input
            type="text"
            name="bunnyVideoId"
            required
            defaultValue={bunnyVideoId}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="c60673c4-ecea-457a-abef-b06df2681be0"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Lesson Description
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={description}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          name="isPreview"
          defaultChecked={isPreview}
          className="h-4 w-4 rounded border-gray-300"
        />
        Make this lesson free preview
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
      >
        {isPending ? "Saving..." : "Save Lesson"}
      </button>
    </form>
  );
};

export default EditLessonForm;