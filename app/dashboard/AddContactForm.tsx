"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
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
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-950 outline-none transition-colors duration-150 placeholder:text-zinc-400 hover:border-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const labelClassName = "flex flex-col gap-1.5 text-sm font-medium text-zinc-700";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Plus className="size-4" aria-hidden="true" />
      )}
      {pending ? "Adding…" : "Add contact"}
    </button>
  );
}

export default function AddContactForm() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [formKey, setFormKey] = useState(0);

  async function handleAction(formData: FormData) {
    const result = await addContact(formData);

    if ("error" in result) {
      toast.error(result.error);
      setDraft(readDraft(formData));
    } else {
      toast.success("Contact added");
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
      className="rounded-xl border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-b border-zinc-100 px-6 py-4">
        <h2 className="text-sm font-medium text-zinc-950">Add a contact</h2>
        <p className="mt-0.5 text-sm text-zinc-500">
          Only the name is required.
        </p>
      </div>

      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        <label className={labelClassName}>
          Name
          <input
            name="name"
            required
            placeholder="Ada Lovelace"
            defaultValue={draft.name}
            className={inputClassName}
          />
        </label>
        <label className={labelClassName}>
          Email
          <input
            type="email"
            name="email"
            placeholder="ada@example.com"
            defaultValue={draft.email}
            className={inputClassName}
          />
        </label>
        <label className={labelClassName}>
          Phone
          <input
            type="tel"
            name="phone"
            placeholder="+1 555 0100"
            defaultValue={draft.phone}
            className={inputClassName}
          />
        </label>
        <label className={labelClassName}>
          Company
          <input
            name="company"
            placeholder="Analytical Engines Ltd."
            defaultValue={draft.company}
            className={inputClassName}
          />
        </label>
      </div>

      <div className="flex justify-end rounded-b-xl border-t border-zinc-100 bg-zinc-50/60 px-6 py-3">
        <SubmitButton />
      </div>
    </form>
  );
}
