"use client";

import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ConfirmationBanner() {
  const searchParams = useSearchParams();

  if (searchParams.get("reset") === "true") {
    return (
      <p
        role="status"
        className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800"
      >
        Password updated. Please sign in with your new password.
      </p>
    );
  }

  if (searchParams.has("error")) {
    return (
      <p
        role="alert"
        className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
      >
        Something went wrong confirming your email. Try signing in, or sign up
        again.
      </p>
    );
  }

  if (searchParams.get("confirmed") === "true") {
    return (
      <p
        role="status"
        className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800"
      >
        Email confirmed! You can now sign in.
      </p>
    );
  }

  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-lg shadow-zinc-900/5 sm:p-10">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-sm">
          M
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-zinc-950">
          Log in
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Sign in to your Mini-CRM account
        </p>

        {/* useSearchParams needs a Suspense boundary so the rest of the page can still prerender. */}
        <Suspense fallback={null}>
          <ConfirmationBanner />
        </Suspense>

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
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-normal text-zinc-950 shadow-xs outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label="Toggle password visibility"
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600"
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-3 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-zinc-500 transition-colors hover:text-indigo-600"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Need an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
