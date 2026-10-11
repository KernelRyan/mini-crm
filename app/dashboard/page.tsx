import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Contact } from "./actions";
import AddContactForm from "./AddContactForm";
import ContactList from "./ContactList";
import SignOutButton from "./SignOutButton";
import SyncContactsButton from "./SyncContactsButton";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Supabase auth reads cookies, which Cache Components requires behind a Suspense boundary. */}
      <Suspense
        fallback={
          <>
            <NavBar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
              <p className="text-sm text-zinc-500">Loading dashboard…</p>
            </main>
          </>
        }
      >
        <Dashboard />
      </Suspense>
    </div>
  );
}

function NavBar({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
            M
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-950">
            Mini-CRM
          </span>
        </div>
        {children}
      </div>
    </nav>
  );
}

async function Dashboard() {
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

  const contacts = (data ?? []) as Contact[];

  return (
    <>
      <NavBar>
        <div className="flex items-center gap-4">
          <span className="hidden truncate text-sm text-zinc-500 sm:block">
            {user.email}
          </span>
          <SignOutButton />
        </div>
      </NavBar>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Contacts
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
            </p>
          </div>
          <SyncContactsButton />
        </header>

        <section className="mt-8">
          <AddContactForm />
        </section>

        <section className="mt-8">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              Could not load contacts: {error.message}
            </p>
          ) : (
            <ContactList contacts={contacts} />
          )}
        </section>
      </main>
    </>
  );
}
