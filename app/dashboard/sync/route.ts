import { createClient } from "@/lib/supabase/server";

const USERS_API_URL = "https://jsonplaceholder.typicode.com/users";
const SYNC_LIMIT = 5;

type ApiUser = {
  name: string;
  email: string;
  phone: string;
  company: { name: string };
};

function isApiUser(value: unknown): value is ApiUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  const company = user.company as Record<string, unknown> | null | undefined;
  return (
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.phone === "string" &&
    typeof company === "object" &&
    company !== null &&
    typeof company.name === "string"
  );
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "You must be signed in to sync contacts." },
      { status: 401 },
    );
  }

  let apiUsers: ApiUser[];
  try {
    const response = await fetch(`${USERS_API_URL}?_limit=${SYNC_LIMIT}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return Response.json(
        { error: `Users API responded with ${response.status}.` },
        { status: 502 },
      );
    }

    const body: unknown = await response.json();
    if (!Array.isArray(body)) {
      return Response.json(
        { error: "Users API returned an unexpected response." },
        { status: 502 },
      );
    }

    apiUsers = body.filter(isApiUser).slice(0, SYNC_LIMIT);
  } catch {
    return Response.json(
      { error: "Could not reach the users API." },
      { status: 502 },
    );
  }

  const emails = apiUsers.map((apiUser) => apiUser.email);
  const { data: existing, error: existingError } = await supabase
    .from("contacts")
    .select("email")
    .in("email", emails);

  if (existingError) {
    return Response.json({ error: existingError.message }, { status: 500 });
  }

  const existingEmails = new Set(existing.map((row) => row.email));
  const rows = apiUsers
    .filter((apiUser) => !existingEmails.has(apiUser.email))
    .map((apiUser) => ({
      user_id: user.id,
      name: apiUser.name,
      email: apiUser.email,
      phone: apiUser.phone,
      company: apiUser.company.name,
    }));

  if (rows.length === 0) {
    return Response.json({ success: true, count: 0 });
  }

  const { error: insertError } = await supabase.from("contacts").insert(rows);

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  return Response.json({ success: true, count: rows.length });
}
