"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
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
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-950 outline-none transition-colors duration-150 placeholder:text-zinc-400 hover:border-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const labelClassName = "flex flex-col gap-1.5 text-sm font-medium text-zinc-700";

function SaveButton() {
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
        <Check className="size-4" aria-hidden="true" />
      )}
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
      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
  const [draft, setDraft] = useState<Draft>(() => draftFromContact(contact));
  const [formKey, setFormKey] = useState(0);

  const updateThisContact = updateContact.bind(null, contact.id);

  async function handleAction(formData: FormData) {
    const result = await updateThisContact(formData);

    if ("error" in result) {
      toast.error(result.error);
      setDraft(readDraft(formData));
      // React auto-resets forms after an action; remount so the edits are kept.
      setFormKey((key) => key + 1);
      return;
    }

    toast.success("Contact updated");
    onCancel();
  }

  return (
    <form
      key={formKey}
      action={handleAction}
      className="rounded-xl border border-indigo-200 bg-white p-5 shadow-sm ring-4 ring-indigo-500/5"
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

      <div className="mt-5 flex justify-end gap-2">
        <CancelButton onCancel={onCancel} />
        <SaveButton />
      </div>
    </form>
  );
}
