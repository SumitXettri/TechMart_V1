"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  // Future sections (rule 22) can be appended here once their schemas exist:
  // { href: "/admin/events", label: "Events" },
  // { href: "/admin/reports", label: "Reports" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={clsx(
              "px-3 py-2 rounded-lg text-sm font-medium transition",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-gray-200 bg-white h-screen sticky top-0">
        <div className="h-16 flex items-center px-5 font-semibold text-gray-900 border-b border-gray-100">
          Admin Panel
        </div>
        <div className="py-4">
          <NavLinks />
        </div>
      </aside>

      {/* Mobile top bar trigger */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-white sticky top-0 z-20">
        <span className="font-semibold text-gray-900">Admin Panel</span>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Admin Panel</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                ✕
              </button>
            </div>
            <div className="py-4">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
