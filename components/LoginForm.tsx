"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
      } else if (data?.user) {
        setMessage("Sign in successful! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white p-8 rounded shadow"
    >
      <h2 className="text-2xl font-semibold mb-4">Sign in</h2>

      {message && <div className="mb-4 text-green-700">{message}</div>}
      {error && <div className="mb-4 text-red-700">{error}</div>}

      <label className="block mb-2">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          className="mt-1 block w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="block mb-6">
        <span className="text-sm font-medium">Password</span>
        <input
          type="password"
          className="mt-1 block w-full rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-60 mb-3"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-center text-zinc-600">
        Don't have an account?{" "}
        <Link href="/register" className="font-medium underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
