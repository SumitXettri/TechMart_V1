"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/deliveries", label: "Delivery" },
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
    <header className="relative z-50 border-b border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/dashboard"
          className="flex shrink-0 items-center gap-2.5 text-xl font-black tracking-tight text-slate-950"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-sm text-slate-950 shadow-sm">
            T
          </span>
          <span>
            TechMart <span className="font-medium text-teal-700">Admin</span>
          </span>
        </Link>

        <nav
          className="ml-auto flex items-center gap-1 overflow-x-auto text-sm"
          aria-label="Admin navigation"
        >
          <Link
            href="/"
            className="mr-1 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
          >
            Home
          </Link>
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "whitespace-nowrap rounded-lg bg-teal-50 px-3 py-2 font-bold text-teal-800"
                    : "whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 border-l border-slate-200 pl-5 sm:flex">
          <span className="max-w-52 truncate text-sm text-slate-500">
            {adminEmail}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
          >
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
