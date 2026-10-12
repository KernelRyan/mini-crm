"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateContact, type Contact } from "./actions";

type Draft = {
  name: string;
  email: string;
  phone: string;
  company: string;
};

function draftFromContact(contact: Contact): Draft {
  return {
    name: contact.name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
  };
}

function readDraft(formData: FormData): Draft {
  const read = (key: keyof Draft) => String(formData.get(key) ?? "");
  return {
    name: read("name"),
    email: read("email"),
    phone: read("phone"),
    company: read("company"),
  };
}

const inputClassName =
  "rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-normal text-zinc-950 shadow-xs outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

const labelClassName = "flex flex-col gap-2 text-sm font-medium text-zinc-700";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

function CancelButton({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      onClick={onCancel}
      disabled={pending}
      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-xs transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Cancel
    </button>
  );
}

export default function EditContactForm({
  contact,
  onCancel,
}: {
  contact: Contact;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => draftFromContact(contact));
  const [formKey, setFormKey] = useState(0);

  const updateThisContact = updateContact.bind(null, contact.id);

  async function handleAction(formData: FormData) {
    setError(null);
    const result = await updateThisContact(formData);

    if ("error" in result) {
      setError(result.error);
      setDraft(readDraft(formData));
      // React auto-resets forms after an action; remount so the edits are kept.
      setFormKey((key) => key + 1);
      return;
    }

    onCancel();
  }

  return (
    <form
      key={formKey}
      action={handleAction}
      className="rounded-xl border border-blue-200 bg-white px-5 py-5 shadow-sm ring-4 ring-blue-500/5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          Name
          <input
            name="name"
            required
            autoFocus
            defaultValue={draft.name}
            className={inputClassName}
          />
        </label>
        <label className={labelClassName}>
          Email
          <input
            type="email"
            name="email"
            defaultValue={draft.email}
            className={inputClassName}
          />
        </label>
        <label className={labelClassName}>
          Phone
          <input
            type="tel"
            name="phone"
            defaultValue={draft.phone}
            className={inputClassName}
          />
        </label>
        <label className={labelClassName}>
          Company
          <input
            name="company"
            defaultValue={draft.company}
            className={inputClassName}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        <CancelButton onCancel={onCancel} />
        <SaveButton />
      </div>
    </form>
  );
}
