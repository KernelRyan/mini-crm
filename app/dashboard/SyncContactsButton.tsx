"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type SyncResponse = { success: true; count: number } | { error: string };

export default function SyncContactsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);

    try {
      const response = await fetch("/dashboard/sync", { cache: "no-store" });
      const data = (await response.json()) as SyncResponse;

      if (!response.ok || "error" in data) {
        toast.error("error" in data ? data.error : "Sync failed.");
        return;
      }

      if (data.count === 0) {
        toast.info("All contacts already synced");
      } else {
        toast.success(
          `Added ${data.count} contact${data.count === 1 ? "" : "s"}`,
        );
      }
      router.refresh();
    } catch {
      toast.error("Sync failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw className="size-4" aria-hidden="true" />
      )}
      {loading ? "Syncing..." : "Sync from API"}
    </button>
  );
}
