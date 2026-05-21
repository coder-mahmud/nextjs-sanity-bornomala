"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

type ActionState = {
  status: "success" | "error";
  message: string;
} | null;

type EditCourseSectionFormProps = {
  action: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  title: string;
  description: string;
};

const EditCourseSectionForm = ({
  action,
  title,
  description,
}: EditCourseSectionFormProps) => {
  const [state, formAction, isPending] = useActionState(action, null);
  const [showForm, setShowForm] = useState(false)

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
    <>
      <h3 onClick={() => setShowForm(!showForm) } className="text-base font-semibold text-gray-900">
        {showForm ? 'Cancel Edit' : 'Edit Section'}
      </h3>
      {showForm ? (
        <form action={formAction} className="mt-5 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Section Title *
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
            Section Description
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={description}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
        >
          {isPending ? "Saving..." : "Save Section"}
        </button>
      </form>
      ) : ''}
      
    
    </>
    
  );
};

export default EditCourseSectionForm;