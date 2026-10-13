"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionStatus = "checking" | "ready" | "invalid";

const MIN_PASSWORD_LENGTH = 6;

const inputClassName =
  "rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-normal text-zinc-950 shadow-xs outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        // The browser client exchanges the `?code=` from the email link during
        // initialization, and getSession() waits for that to finish.
        const supabase = createClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!cancelled) {
          setStatus(session && !sessionError ? "ready" : "invalid");
        }
      } catch {
        if (!cancelled) {
          setStatus("invalid");
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // The password is already changed, so a failed sign-out should not block the redirect.
      await supabase.auth.signOut().catch(() => undefined);
      router.push("/login?reset=true");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-lg shadow-zinc-900/5 sm:p-10">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-sm">
          M
        </div>

        {status === "checking" ? (
          <p className="mt-6 text-center text-sm text-zinc-500">
            Verifying your reset link…
          </p>
        ) : null}

        {status === "invalid" ? (
          <>
            <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-zinc-950">
              Link expired
            </h1>
            <p
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              This reset link is invalid or expired.
            </p>
            <p className="mt-8 text-center text-sm text-zinc-500">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Request a new reset link
              </Link>
            </p>
          </>
        ) : null}

        {status === "ready" ? (
          <>
            <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-zinc-950">
              Set a new password
            </h1>
            <p className="mt-2 text-center text-sm text-zinc-500">
              Choose a password with at least {MIN_PASSWORD_LENGTH} characters
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                New password
                <input
                  type="password"
                  name="newPassword"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClassName}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Confirm password
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClassName}
                />
              </label>

              {error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating password…" : "Update password"}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </main>
  );
}
