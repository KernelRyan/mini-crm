"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
};

type ActionResult = { error: string } | { success: true };

function optionalField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function addContact(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to add contacts." };
  }

  const name = optionalField(formData, "name");
  if (!name) {
    return { error: "Name is required." };
  }

  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    name,
    email: optionalField(formData, "email"),
    phone: optionalField(formData, "phone"),
    company: optionalField(formData, "company"),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  if (typeof id !== "string" || id === "") {
    return { error: "Invalid contact id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to delete contacts." };
  }

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
