"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

type ActionState = {
  status: "success" | "error";
  message: string;
} | null;

type DeleteCourseSectionFormProps = {
  action: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
};

const DeleteCourseSectionForm = ({
  action,
}: DeleteCourseSectionFormProps) => {
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
    <form
      action={formAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this section? All lessons inside this section will also be deleted.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete Section"}
      </button>
    </form>
  );
};

export default DeleteCourseSectionForm;