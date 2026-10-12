import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow, subDays } from "date-fns";
import { Building2, TrendingUp, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Contact } from "../actions";

const RECENT_LIMIT = 5;

export default function OverviewPage() {
  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Overview
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          A snapshot of your contacts.
        </p>
      </header>

      {/* Supabase auth reads cookies, which Cache Components requires behind a Suspense boundary. */}
      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </>
  );
}

function OverviewSkeleton() {
  return (
    <div className="mt-8 animate-pulse" aria-label="Loading overview">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-32 rounded-xl border border-zinc-200 bg-white" />
        <div className="h-32 rounded-xl border border-zinc-200 bg-white" />
        <div className="h-32 rounded-xl border border-zinc-200 bg-white" />
      </div>
      <div className="mt-10 h-72 rounded-xl border border-zinc-200 bg-white" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 tabular-nums">
        {value}
      </p>
    </div>
  );
}

async function Overview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("id, user_id, name, email, phone, company, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
        Could not load contacts: {error.message}
      </p>
    );
  }

  const contacts = data as Contact[];
  const weekAgo = subDays(new Date(), 7);
  const addedThisWeek = contacts.filter(
    (contact) => new Date(contact.created_at) >= weekAgo,
  ).length;
  const companyCount = new Set(
    contacts
      .map((contact) => contact.company?.trim().toLowerCase())
      .filter((company): company is string => Boolean(company)),
  ).size;
  const recentContacts = contacts.slice(0, RECENT_LIMIT);

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total contacts" value={contacts.length} icon={Users} />
        <StatCard
          label="Added this week"
          value={addedThisWeek}
          icon={TrendingUp}
        />
        <StatCard label="Companies" value={companyCount} icon={Building2} />
      </section>

      <section className="mt-10">
        <h2 className="text-base font-medium text-zinc-950">Recent contacts</h2>

        {recentContacts.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
            <Users className="size-12 text-zinc-300" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold text-zinc-950">
              No contacts yet
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Add your first contact to see it here.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500 active:scale-[0.98]"
            >
              Go to contacts
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white shadow-sm">
            {recentContacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote SVG avatars aren't configured for next/image */}
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contact.name)}&backgroundColor=6366f1`}
                    alt=""
                    width={36}
                    height={36}
                    loading="lazy"
                    className="size-9 shrink-0 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-950">
                      {contact.name}
                    </p>
                    <p className="truncate text-sm text-zinc-500">
                      {contact.company ?? contact.email ?? "No details"}
                    </p>
                  </div>
                </div>
                <time
                  dateTime={contact.created_at}
                  className="shrink-0 text-xs text-zinc-400"
                >
                  {formatDistanceToNow(new Date(contact.created_at), {
                    addSuffix: true,
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
