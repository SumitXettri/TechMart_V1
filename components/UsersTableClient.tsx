"use client";

import { useState } from "react";
import type { ListUsersResult } from "@/lib/users-repo";

type UserId = string;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function initials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "U";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function UsersTableClient({
  initialResult,
}: {
  initialResult: ListUsersResult;
}) {
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<UserId | null>(null);

  async function handleDelete(id: UserId) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setError(null);
    setSavingId(id);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        setError(data?.error ?? "Failed to delete user.");
        return;
      }
      setResult((previous) => ({
        ...previous,
        users: previous.users.filter((user) => user.id !== id),
        total: previous.total - 1,
      }));
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRoleChange(id: UserId, role: string) {
    setError(null);
    setSavingId(id);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await response.json().catch(() => null)) as {
        role?: string;
        error?: string;
      } | null;
      if (!response.ok) {
        setError(data?.error ?? "Failed to update role.");
        return;
      }
      setResult((previous) => ({
        ...previous,
        users: previous.users.map((user) =>
          user.id === id ? { ...user, role: data?.role ?? role } : user,
        ),
      }));
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
            Directory
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Users <span className="text-slate-400">({result.total})</span>
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Manage access and account status
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Verification</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {result.users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <p className="font-medium text-slate-900">No users found</p>
                  <p className="mt-1 text-slate-500">
                    Try adjusting the current filters.
                  </p>
                </td>
              </tr>
            ) : (
              result.users.map((user) => {
                const saving = savingId === user.id;
                return (
                  <tr
                    key={user.id}
                    className="transition hover:bg-violet-50/40"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-xs font-bold text-violet-700">
                          {initials(user.fullName, user.email)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.fullName || "Unnamed user"}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        disabled={saving}
                        aria-label={`Role for ${user.email}`}
                        onChange={(event) =>
                          handleRoleChange(user.id, event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-wait disabled:opacity-60"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="SUPPORT">Support</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          user.emailVerified
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                        }
                      >
                        {user.emailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleDelete(user.id)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
