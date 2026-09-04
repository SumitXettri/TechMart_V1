"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    console.log("[RegisterForm] Starting registration", {
      email,
      fullName: fullName.trim(),
      phone: phone.trim(),
    });

    try {
      console.log("[RegisterForm] Calling supabase.auth.signUp");
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      console.log("[RegisterForm] signUp response", { data, signUpError });

      if (signUpError) {
        console.error("[RegisterForm] signUp error", signUpError);
        setError(signUpError.message);
        return;
      }

      const user = data?.user;

      if (!user) {
        console.error("[RegisterForm] No user returned from signUp", data);
        setError("User registration succeeded but no user was returned.");
        return;
      }

      const profilePayload = {
        id: user.id,
        email: user.email ?? email,
        phone: phone.trim() || null,
        full_name: fullName.trim(),
        role: "CUSTOMER",
        email_verified: Boolean(user.email_confirmed_at),
      };

      console.log("[RegisterForm] Inserting profile row", profilePayload);

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .upsert(profilePayload, { onConflict: "id" })
        .select();

      console.log("[RegisterForm] profile insert response", {
        profileData,
        profileError,
      });

      if (profileError) {
        console.error("[RegisterForm] profile insert error", profileError);
        setError(profileError.message);
        return;
      }

      console.log("[RegisterForm] Registration successful");
      router.push("/login");
    } catch (err: unknown) {
      console.error("[RegisterForm] unexpected registration error", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      console.log("[RegisterForm] Finished registration attempt");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.45)]"
    >
      <h2 className="mb-4 text-2xl font-black text-slate-950">
        Create account
      </h2>

      {message && <div className="mb-4 text-green-700">{message}</div>}
      {error && <div className="mb-4 text-red-700">{error}</div>}

      <label className="block mb-2">
        <span className="text-sm font-medium">Full name</span>
        <input
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm font-medium">Phone (optional)</span>
        <input
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm font-medium">Password</span>
        <input
          type="password"
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-950 py-3 font-bold text-white transition hover:bg-teal-800 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
