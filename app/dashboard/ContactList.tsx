"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Search,
  SearchX,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteContact, type Contact } from "./actions";
import EditContactForm from "./EditContactForm";

const PAGE_SIZE = 10;

const paginationButtonClassName =
  "flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:active:scale-100";

const rowActionClassName =
  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

function matchesQuery(contact: Contact, query: string) {
  return [contact.name, contact.email, contact.company].some((field) =>
    field?.toLowerCase().includes(query),
  );
}

function avatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`;
}

export default function ContactList({ contacts }: { contacts: Contact[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function clearSearch() {
    updateQuery("");
    searchInputRef.current?.focus();
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteContact(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Contact deleted");
      }
      setDeletingId(null);
    });
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
        <Users size={48} className="text-zinc-300" aria-hidden="true" />
        <p className="mt-4 text-lg font-semibold text-zinc-950">
          No contacts yet
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Add your first contact or sync from the API to get started
        </p>
      </div>
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

  const totalPages = Math.max(1, Math.ceil(visibleContacts.length / PAGE_SIZE));
  // Clamped so deleting the last contact on the last page doesn't strand the user on an empty page.
  const currentPage = Math.min(page, totalPages);
  const pageContacts = visibleContacts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") updateQuery("");
          }}
          placeholder="Search by name, email, or company"
          aria-label="Search contacts"
          className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-10 pl-9 text-sm text-zinc-950 outline-none transition-colors duration-150 placeholder:text-zinc-400 hover:border-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        {query ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {visibleContacts.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
          <SearchX size={48} className="text-zinc-300" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold text-zinc-950">
            No contacts match your search
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Try a different name, email, or company.
          </p>
          <button
            type="button"
            onClick={clearSearch}
            className="mt-6 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 active:scale-[0.98]"
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {pageContacts.map((contact) =>
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
                className="group flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition-colors duration-150 hover:border-zinc-300"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote SVG avatars aren't configured for next/image */}
                  <img
                    src={avatarUrl(contact.name)}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10 shrink-0 rounded-full"
                  />
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-950">
                        {contact.name}
                      </p>
                      {contact.company ? (
                        <span className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
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
                    className={`${rowActionClassName} text-zinc-500 hover:bg-zinc-100 hover:text-indigo-600`}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id)}
                    disabled={isPending}
                    className={`${rowActionClassName} text-red-600 hover:bg-red-50 hover:text-red-700`}
                  >
                    {deletingId === contact.id ? (
                      <Loader2
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    )}
                    {deletingId === contact.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="Contacts pagination"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={paginationButtonClassName}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </button>
          <p className="text-sm text-zinc-500" aria-live="polite">
            Page{" "}
            <span className="font-medium text-zinc-950 tabular-nums">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-medium text-zinc-950 tabular-nums">
              {totalPages}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={paginationButtonClassName}
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
