# Mini-CRM

A small but complete CRM built with Next.js 16 and Supabase. Users can sign up, log in, and manage their own private list of contacts.

## Features

- Email/password authentication via Supabase Auth
- Per-user data isolation using Postgres Row Level Security (RLS)
- Create, view, and delete contacts
- One-click "Sync from API" that pulls sample contacts from jsonplaceholder.typicode.com
- Session refresh via middleware

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + RLS)

## Row Level Security

The `contacts` table uses Postgres Row Level Security. Every query is automatically scoped to the authenticated user — enforced at the database level, not just in application code. Even if the frontend were compromised, one user could never read another user's contacts.

Policies applied in `supabase/migrations/001_contacts_with_rls.sql`:

- SELECT: `auth.uid() = user_id`
- INSERT: `with check (auth.uid() = user_id)`
- UPDATE: `using (auth.uid() = user_id)`
- DELETE: `using (auth.uid() = user_id)`

## Project Structure

    app/
      auth/callback/route.ts       Supabase auth code exchange
      dashboard/
        page.tsx                   Main CRM view (Server Component)
        actions.ts                 Server Actions: addContact, deleteContact
        AddContactForm.tsx         Manual entry form
        ContactList.tsx            Renders and deletes contacts
        SyncContactsButton.tsx     Triggers the external API sync
        SignOutButton.tsx          Logout
        sync/route.ts              Fetches external API data
      login/page.tsx               Login form
      signup/page.tsx              Signup form

    lib/supabase/
      client.ts                    Browser Supabase client
      server.ts                    Server Supabase client (cookies-aware)

    middleware.ts                  Refreshes auth session on every request

    supabase/migrations/
      001_contacts_with_rls.sql    Table + RLS policies

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

7. Open http://localhost:3000

## Security Notes

- Only the Supabase `anon` key is used. The `service_role` key is never exposed.
- `.env.local` is git-ignored. Only `.env.example` with placeholder values is committed.
- All mutations run through Server Actions or Route Handlers — the client never writes directly to the database.