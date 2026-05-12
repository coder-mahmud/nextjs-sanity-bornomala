"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

const SubmitButton = ({
  text,
  loadingText,
}: {
  text: string;
  loadingText?: string;
}) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && <Loader2 size={18} className="animate-spin" />}

      {pending ? loadingText || "Please wait..." : text}
    </button>
  );
};

export default SubmitButton;