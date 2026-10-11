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
      <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">
        No contacts yet
      </p>
    );
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white shadow-sm">
        {contacts.map((contact) => (
          <li
            key={contact.id}
            className="flex items-start justify-between gap-4 px-6 py-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-950">
                {contact.name}
                {contact.company ? (
                  <span className="font-normal text-zinc-500">
                    {" "}
                    · {contact.company}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 truncate text-sm text-zinc-500">
                {[contact.email, contact.phone].filter(Boolean).join(" · ") ||
                  "No contact details"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(contact.id)}
              disabled={isPending}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId === contact.id ? "Deleting…" : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
