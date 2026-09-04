"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/products", label: "Products" },
];

export default function AdminHeader({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <header
      className="relative z-99 border-b border-violet-800 text-white shadow-lg"
      style={{ backgroundColor: "#4c1d95" }}
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/dashboard"
          className="text-xl font-bold tracking-tight"
        >
          TechMart <span className="font-normal text-violet-300">Admin</span>
        </Link>

        <nav
          className="flex items-center gap-1 text-sm"
          aria-label="Admin navigation"
        >
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "rounded-lg text-black px-3 py-2 font-semibold"
                    : "rounded-lg px-3 py-2 font-medium text-violet-100 transition hover:bg-violet-800 hover:text-white"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="max-w-52 truncate text-sm text-violet-200">
            {adminEmail}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="rounded-full  px-4 py-2 text-sm font-semibold text-violet-950 transition hover:bg-violet-100 disabled:opacity-60"
          >
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
