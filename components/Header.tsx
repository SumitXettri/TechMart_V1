"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function Header({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{adminEmail}</span>
        <button
          onClick={logout}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
