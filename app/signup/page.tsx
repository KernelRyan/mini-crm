"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Check your email to confirm your account.");

    if (data.session) {
      router.push("/dashboard");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-lg shadow-zinc-900/5 sm:p-10">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-sm">
          M
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-zinc-950">
          Sign up
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Create your Mini-CRM account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-normal text-zinc-950 shadow-xs outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Password
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-normal text-zinc-950 shadow-xs outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
