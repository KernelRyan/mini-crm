import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Contact } from "./actions";
import AddContactForm from "./AddContactForm";
import ContactList from "./ContactList";
import SignOutButton from "./SignOutButton";

export default function DashboardPage() {
  return (
    <main className="flex-1 bg-zinc-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* Supabase auth reads cookies, which Cache Components requires behind a Suspense boundary. */}
        <Suspense
          fallback={<p className="text-sm text-zinc-500">Loading dashboard…</p>}
        >
          <Dashboard />
        </Suspense>
      </div>
    </main>
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
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <section className="mt-8">
        <AddContactForm />
      </section>

      <section className="mt-8">
        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Could not load contacts: {error.message}
          </p>
        ) : (
          <ContactList contacts={contacts} />
        )}
      </section>
    </>
  );
}
