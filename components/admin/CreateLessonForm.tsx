"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

type ActionState = {
  status: "success" | "error";
  message: string;
} | null;

type CreateLessonFormProps = {
  action: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  defaultLibraryId?: string;
};

const CreateLessonForm = ({
  action,
  defaultLibraryId = "",
}: CreateLessonFormProps) => {
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
    <form action={formAction} className="mt-5 space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Lesson Title *
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Welcome to the course"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Duration Seconds
          </label>
          <input
            type="number"
            name="durationSeconds"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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
            defaultValue={defaultLibraryId}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            placeholder="666089"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave this as default if all videos use one Bunny library.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bunny Video ID *
          </label>
          <input
            type="text"
            name="bunnyVideoId"
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Short lesson summary."
        />
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          name="isPreview"
          className="h-4 w-4 rounded border-gray-300"
        />
        Make this lesson free preview
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isPending ? "Adding..." : "Add Lesson"}
      </button>
    </form>
  );
};

export default CreateLessonForm;