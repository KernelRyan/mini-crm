import { createClient } from "@/lib/supabase/server";
import { Box } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SidebarNav from "./SidebarNav";
import SignOutButton from "./SignOutButton";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="flex-1">
      <aside className="flex flex-col gap-6 bg-zinc-950 px-4 py-5 text-zinc-300 md:fixed md:inset-y-0 md:left-0 md:w-64">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2 text-white"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
            <Box className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            Mini-CRM
          </span>
        </Link>

        <SidebarNav />

        <div className="mt-auto border-t border-white/10 pt-4">
          {/* Reading the user touches cookies, which Cache Components requires behind Suspense. */}
          <Suspense
            fallback={<div className="mx-2 h-4 w-32 animate-pulse rounded bg-white/10" />}
          >
            <SidebarUser />
          </Suspense>
        </div>
      </aside>

      <main className="min-h-screen bg-zinc-50 md:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

async function SidebarUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 px-2">
      <p className="truncate text-xs text-zinc-500" title={user.email}>
        {user.email}
      </p>
      <SignOutButton />
    </div>
  );
}
