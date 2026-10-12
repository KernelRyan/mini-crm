import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  if (searchParams.has("error") || searchParams.has("error_description")) {
    redirect("/login?error=expired_link");
  }

  const code = searchParams.get("code");

  if (!code) {
    redirect("/login?error=missing_code");
  }

  let destination = "/login?error=confirmation_failed";

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Email confirmation code exchange failed:", error.message);
    } else {
      destination = "/login?confirmed=true";
    }
  } catch (err) {
    console.error("Email confirmation callback threw:", err);
  }

  // redirect() throws to signal the redirect, so it must stay outside the try/catch above.
  redirect(destination);
}
