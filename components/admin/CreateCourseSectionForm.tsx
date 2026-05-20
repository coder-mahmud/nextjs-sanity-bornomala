"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

type ActionState = {
  status: "success" | "error";
  message: string;
} | null;

type CreateCourseSectionFormProps = {
  action: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
};

const CreateCourseSectionForm = ({
  action,
}: CreateCourseSectionFormProps) => {
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
    <form action={formAction} className="mt-6 space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Section Title *
        </label>
        <input
          type="text"
          name="title"
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Introduction"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Section Description
        </label>
        <textarea
          name="description"
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Short explanation of this section."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isPending ? "Adding..." : "Add Section"}
      </button>
    </form>
  );
};

export default CreateCourseSectionForm;