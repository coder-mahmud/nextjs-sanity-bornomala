"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBranch, updateBranch } from "./actions";
import { toast } from "react-toastify";
import { Edit, Plus } from "lucide-react";

interface BranchFormProps {
  branch?: {
    id: string;
    name: string;
    address: string | null;
  };
}

export default function BranchForm({ branch }: BranchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!branch); // Open inline if creating, closed if modal/edit

  const isEditing = Boolean(branch);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const action = isEditing && branch
      ? updateBranch(branch.id, formData)
      : createBranch(formData);

    toast
      .promise(action, {
        pending: isEditing ? "Updating branch..." : "Creating branch...",
        success: isEditing ? "Branch updated!" : "Branch created!",
        error: "Failed to process request.",
      })
      .then((res) => {
        if (res?.success) {
          if (isEditing) setIsOpen(false);
          else (e.target as HTMLFormElement).reset();
          router.refresh();
        } else if (res?.message) {
          toast.error(res.message);
        }
      })
      .catch((err) => {
        console.error("Error saving branch:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (isEditing && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
      >
        <Edit className="w-4 h-4" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Branch Name *
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={branch?.name || ""}
          placeholder="e.g. Paris Campus"
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          name="address"
          defaultValue={branch?.address || ""}
          placeholder="e.g. 123 Rue de Rivoli, Paris"
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        {isEditing && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-xl border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Branch"}
        </button>
      </div>
    </form>
  );
}