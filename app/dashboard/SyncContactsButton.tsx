"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SyncResponse = { success: true; count: number } | { error: string };

export default function SyncContactsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [message]);

  async function handleSync() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/dashboard/sync", { cache: "no-store" });
      const data = (await response.json()) as SyncResponse;

      if (!response.ok || "error" in data) {
        setError("error" in data ? data.error : "Sync failed.");
        return;
      }

      setMessage(
        data.count === 0
          ? "Already up to date."
          : `Synced ${data.count} contact${data.count === 1 ? "" : "s"}.`,
      );
      router.refresh();
    } catch {
      setError("Sync failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="rounded-md bg-zinc-950 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Syncing..." : "Sync from API"}
      </button>
      {message ? <p className="text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
