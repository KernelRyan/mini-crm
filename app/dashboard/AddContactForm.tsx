"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { addContact } from "./actions";

type Draft = {
  name: string;
  email: string;
  phone: string;
  company: string;
};

const EMPTY_DRAFT: Draft = { name: "", email: "", phone: "", company: "" };

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
  "rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-normal text-zinc-950 outline-none ring-zinc-950/10 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add contact"}
    </button>
  );
}

export default function AddContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [formKey, setFormKey] = useState(0);

  async function handleAction(formData: FormData) {
    setError(null);
    const result = await addContact(formData);

    if ("error" in result) {
      setError(result.error);
      setDraft(readDraft(formData));
    } else {
      setDraft(EMPTY_DRAFT);
    }

    // React auto-resets forms after an action, so remount with the right defaults:
    // empty on success, the submitted values on error.
    setFormKey((key) => key + 1);
  }

  return (
    <form
      key={formKey}
      action={handleAction}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-base font-semibold text-zinc-950">Add a contact</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Name
          <input
            name="name"
            required
            defaultValue={draft.name}
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            name="email"
            defaultValue={draft.email}
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Phone
          <input
            type="tel"
            name="phone"
            defaultValue={draft.phone}
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Company
          <input
            name="company"
            defaultValue={draft.company}
            className={inputClassName}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
