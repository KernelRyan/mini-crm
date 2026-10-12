import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    redirect("/login?error=missing_code");
  }

  let confirmed = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    confirmed = !error;
  } catch {
    confirmed = false;
  }

  // redirect() throws to signal the redirect, so it must stay outside the try/catch above.
  redirect(
    confirmed ? "/login?confirmed=true" : "/login?error=confirmation_failed",
  );
}
