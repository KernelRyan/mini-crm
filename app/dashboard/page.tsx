import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Contact } from "./actions";
import AddContactForm from "./AddContactForm";
import ContactList from "./ContactList";
import SyncContactsButton from "./SyncContactsButton";

export default function DashboardPage() {
  return (
    // Supabase auth reads cookies, which Cache Components requires behind a Suspense boundary.
    <Suspense fallback={<ContactsSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function ContactsSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Loading contacts">
      <div className="h-7 w-32 rounded-lg bg-zinc-200" />
      <div className="mt-2 h-4 w-20 rounded bg-zinc-200" />
      <div className="mt-8 h-64 rounded-xl border border-zinc-200 bg-white" />
      <div className="mt-8 flex flex-col gap-3">
        <div className="h-18 rounded-xl border border-zinc-200 bg-white" />
        <div className="h-18 rounded-xl border border-zinc-200 bg-white" />
        <div className="h-18 rounded-xl border border-zinc-200 bg-white" />
      </div>
    </div>
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
    </>
  );
}
