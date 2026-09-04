"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/users-repo";

type UserManagementTableProps = {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
};

type EditableUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  email_verified: boolean;
};

type CreateUserForm = {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  email_verified: boolean;
  password: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function UserManagementTable({
  users,
  total,
  page,
  totalPages,
}: UserManagementTableProps) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [creatingUser, setCreatingUser] = useState<CreateUserForm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openCreateUser = () => {
    setErrorMessage(null);
    setCreatingUser({
      full_name: "",
      email: "",
      phone: "",
      role: "CUSTOMER",
      email_verified: false,
      password: "",
    });
  };

  const closeCreateUser = () => {
    setCreatingUser(null);
    setErrorMessage(null);
  };

  const openEditor = (user: AdminUser) => {
    setErrorMessage(null);
    setEditingUser({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role,
      email_verified: user.email_verified,
    });
  };

  const closeEditor = () => {
    setEditingUser(null);
    setErrorMessage(null);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: editingUser.full_name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          emailVerified: editingUser.email_verified,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.error ?? data?.message ?? "Unable to update user.",
        );
      }

      closeEditor();
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${deleteId}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.error ?? data?.message ?? "Unable to delete user.",
        );
      }

      setDeleteId(null);
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!creatingUser) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: creatingUser.full_name,
          email: creatingUser.email,
          phone: creatingUser.phone,
          role: creatingUser.role,
          emailVerified: creatingUser.email_verified,
          password: creatingUser.password,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.error ?? data?.message ?? "Unable to create user.",
        );
      }

      closeCreateUser();
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No users match the current filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.full_name || "Unnamed user"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.email_verified
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                        }
                      >
                        {user.email_verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditor(user)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(user.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/60">
        <div className="text-sm text-slate-500">
          {total > 0 ? `Page ${page} of ${totalPages}` : "No results"}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500">{total} users</div>
          <button
            type="button"
            onClick={openCreateUser}
            className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Create user
          </button>
        </div>
      </div>

      {creatingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Create account
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Add new user
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCreateUser}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Full name
                </span>
                <input
                  required
                  value={creatingUser.full_name}
                  onChange={(event) =>
                    setCreatingUser((current) =>
                      current
                        ? { ...current, full_name: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={creatingUser.email}
                  onChange={(event) =>
                    setCreatingUser((current) =>
                      current
                        ? { ...current, email: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Phone
                </span>
                <input
                  value={creatingUser.phone}
                  onChange={(event) =>
                    setCreatingUser((current) =>
                      current
                        ? { ...current, phone: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Role
                </span>
                <select
                  value={creatingUser.role}
                  onChange={(event) =>
                    setCreatingUser((current) =>
                      current
                        ? { ...current, role: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Password
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={creatingUser.password}
                  onChange={(event) =>
                    setCreatingUser((current) =>
                      current
                        ? { ...current, password: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:col-span-2">
                <input
                  type="checkbox"
                  checked={creatingUser.email_verified}
                  onChange={(event) =>
                    setCreatingUser((current) =>
                      current
                        ? { ...current, email_verified: event.target.checked }
                        : current,
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Email verified
                </span>
              </label>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCreateUser}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  User details
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Edit profile
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Full name
                </span>
                <input
                  required
                  value={editingUser.full_name}
                  onChange={(event) =>
                    setEditingUser((current) =>
                      current
                        ? { ...current, full_name: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(event) =>
                    setEditingUser((current) =>
                      current
                        ? { ...current, email: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Phone
                </span>
                <input
                  value={editingUser.phone}
                  onChange={(event) =>
                    setEditingUser((current) =>
                      current
                        ? { ...current, phone: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Role
                </span>
                <select
                  value={editingUser.role}
                  onChange={(event) =>
                    setEditingUser((current) =>
                      current
                        ? { ...current, role: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:col-span-2">
                <input
                  type="checkbox"
                  checked={editingUser.email_verified}
                  onChange={(event) =>
                    setEditingUser((current) =>
                      current
                        ? { ...current, email_verified: event.target.checked }
                        : current,
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Email verified
                </span>
              </label>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-sm font-medium text-slate-500">Confirm action</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              Delete user?
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              This action will remove the selected user record from the system.
            </p>

            {errorMessage ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteId(null);
                  setErrorMessage(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
