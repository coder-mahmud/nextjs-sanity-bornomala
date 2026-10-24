// app/admin/users/_components/CreateUserModalButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Mail, Lock, User, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { createUser } from "../actions";

export default function CreateUserModalButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("role", formData.role);

        const res = await createUser(null, data);

        if (res.status === "success") {
          resolve(res);
          setIsOpen(false);
          setFormData({ name: "", email: "", password: "", role: "ADMIN" });
          router.refresh();
        } else {
          reject(new Error(res.message || "Failed to create user."));
        }
      } catch (err) {
        reject(err);
      } finally {
        setLoading(false);
      }
    });

    toast.promise(promise, {
      pending: "Creating user account...",
      success: "User created successfully! 🎉",
      error: {
        render({ data }: any) {
          return data?.message || "Error creating user.";
        },
      },
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition cursor-pointer shadow-xs"
      >
        <UserPlus className="w-4 h-4" />
        Create New User
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" /> Create User Account
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">Full Name</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-black focus:outline-none pl-9"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">Email Address *</label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-black focus:outline-none pl-9"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">Password *</label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-black focus:outline-none pl-9"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700">Assign Role *</label>
                <div className="relative mt-1">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-black focus:outline-none pl-9 bg-white cursor-pointer"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>
                  <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer transition"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}