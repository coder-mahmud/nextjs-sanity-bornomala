'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, ShoppingCart, Package, Settings, BadgeQuestionMark, Video  } from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Quiz",
    href: "/admin/quizes",
    icon: BadgeQuestionMark ,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: Video,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: ShoppingCart,
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: ShoppingCart,
  },
  // {
  //   label: "Products",
  //   href: "/admin/products",
  //   icon: Package,
  // },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 md:hidden">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-72 bg-gray-900 text-white transition-transform duration-300
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:z-auto md:w-64 md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-5">
          <div>
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="mt-1 text-sm text-gray-400">Manage your system</p>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1 text-gray-300 hover:bg-gray-800 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-gray-900"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}