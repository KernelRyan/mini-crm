"use client";

import { useRef, useState, useTransition } from "react";
import { deleteContact, type Contact } from "./actions";
import EditContactForm from "./EditContactForm";

function matchesQuery(contact: Contact, query: string) {
  return [contact.name, contact.email, contact.company].some((field) =>
    field?.toLowerCase().includes(query),
  );
}

export default function ContactList({ contacts }: { contacts: Contact[] }) {
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  function clearSearch() {
    setQuery("");
    searchInputRef.current?.focus();
  }

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

  const normalizedQuery = query.trim().toLowerCase();
  // The contact being edited stays visible so typing a search can't discard unsaved edits.
  const visibleContacts = normalizedQuery
    ? contacts.filter(
        (contact) =>
          contact.id === editingId || matchesQuery(contact, normalizedQuery),
      )
    : contacts;

  return (
    <div>
      <div className="relative mb-4">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
          placeholder="Search by name, email, or company"
          aria-label="Search contacts"
          className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-10 pl-10 text-sm text-zinc-950 shadow-xs outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
        {query ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {visibleContacts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
          No contacts match your search
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {visibleContacts.map((contact) =>
          editingId === contact.id ? (
            <li key={contact.id}>
              <EditContactForm
                contact={contact}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
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
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingId(contact.id)}
                  disabled={isPending}
                  className="rounded-md px-2 py-1 text-sm font-medium text-zinc-500 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(contact.id)}
                  disabled={isPending}
                  className="rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === contact.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
