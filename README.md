# Mini-CRM

**🔗 Live demo:** https://mini-crm-amber-ten.vercel.app

A small but complete CRM built with Next.js 16 and Supabase. Users sign up, log in, and manage a private list of contacts. Includes authentication, per-user data isolation via Postgres Row Level Security (RLS), and external API integration.

## Features

- **Email/password authentication** via Supabase Auth, with email confirmation flow
- **Per-user data isolation** enforced at the database level with Postgres RLS policies
- **Full CRUD** — create, view, edit, delete contacts
- **Search & filter** — client-side filtering by name, email, or company
- **Pagination** — 10 contacts per page with Prev/Next controls
- **External API integration** — one-click sync from jsonplaceholder.typicode.com, with de-duplication so repeated syncs never create duplicate contacts
- **Stats overview** — total contacts, contacts added this week, unique companies
- **Modern UI** — sidebar navigation, toast notifications, DiceBear avatars, responsive layout
- **Session refresh middleware** — keeps users logged in across page loads

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Auth & Database:** Supabase (PostgreSQL + Auth + RLS)
- **Icons:** lucide-react
- **Toasts:** sonner
- **Dates:** date-fns
- **Deployment:** Vercel

## Row Level Security (RLS)

The `contacts` table uses Postgres Row Level Security. Every query is automatically scoped to the authenticated user — enforced at the database layer, not just in application code. Even if the frontend were compromised, one user could never read another user's contacts.

Policies defined in `supabase/migrations/001_contacts_with_rls.sql`:

| Operation | Policy |
|---|---|
| SELECT | `auth.uid() = user_id` |
| INSERT | `with check (auth.uid() = user_id)` |
| UPDATE | `using (auth.uid() = user_id)` |
| DELETE | `using (auth.uid() = user_id)` |

For a deeper explanation of the security model, see [SECURITY.md](./SECURITY.md).

## Project Structure

    app/
      layout.tsx                   Root layout (Toaster)
      page.tsx                     Redirects to /login
      login/page.tsx               Login form
      signup/page.tsx              Signup form
      auth/callback/route.ts       Supabase email confirmation callback

      dashboard/
        layout.tsx                 Sidebar layout
        page.tsx                   Contacts page (search, pagination, CRUD)
        overview/page.tsx          Stats dashboard
        actions.ts                 Server Actions: addContact, updateContact, deleteContact
        AddContactForm.tsx         Manual entry form
        EditContactForm.tsx        Inline edit form
        ContactList.tsx            Contact list with search & pagination
        SyncContactsButton.tsx     External API sync trigger
        SignOutButton.tsx          Logout
        sync/route.ts              Route Handler: fetches jsonplaceholder API

    lib/supabase/
      client.ts                    Browser Supabase client
      server.ts                    Server Supabase client (cookies-aware)

    middleware.ts                  Refreshes auth session on every request

    supabase/migrations/
      001_contacts_with_rls.sql    Table + RLS policies

    SECURITY.md                    Security model documentation

## Getting Started

1. Clone the repo:

       git clone https://github.com/KernelRyan/mini-crm.git
       cd mini-crm

2. Install dependencies:

       npm install

3. Create a project at supabase.com.

4. Run the SQL in `supabase/migrations/001_contacts_with_rls.sql` in the Supabase SQL Editor.

5. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key.

6. Start the dev server:

       npm run dev

7. Open http://localhost:3000 and sign up.

## Security Notes

- Only the Supabase `anon` key is used. The `service_role` key is never exposed.
- `.env.local` is git-ignored. Only `.env.example` with placeholder values is committed.
- All mutations run through Server Actions or Route Handlers — the client never writes directly to the database.
- See [SECURITY.md](./SECURITY.md) for the full threat model.

## License

MIT