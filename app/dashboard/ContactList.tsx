"use client";

import { useState, useTransition } from "react";
import { deleteContact, type Contact } from "./actions";

export default function ContactList({ contacts }: { contacts: Contact[] }) {
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteContact(id);
      if ("error" in result) {
        setError(result.error);
      }
      setDeletingId(null);
    });
  }

  if (contacts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
        No contacts yet
      </p>
    );
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 transition hover:border-zinc-300 hover:shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-50 to-indigo-100 text-sm font-semibold text-indigo-700">
                {contact.name.trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-semibold text-zinc-950">
                    {contact.name}
                  </p>
                  {contact.company ? (
                    <span className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
                      {contact.company}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-sm text-zinc-500">
                  {[contact.email, contact.phone]
                    .filter(Boolean)
                    .join(" · ") || "No contact details"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(contact.id)}
              disabled={isPending}
              className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId === contact.id ? "Deleting…" : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
