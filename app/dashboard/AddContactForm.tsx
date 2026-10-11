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
  "rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-normal text-zinc-950 shadow-xs outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

const labelClassName = "flex flex-col gap-2 text-sm font-medium text-zinc-700";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-base font-semibold text-zinc-950">Add a contact</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Only the name is required.
      </p>

      <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
        <label className={labelClassName}>
          Name
          <input
            name="name"
            required
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
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end border-t border-zinc-100 pt-6">
        <SubmitButton />
      </div>
    </form>
  );
}
