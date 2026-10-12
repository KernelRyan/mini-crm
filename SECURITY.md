# Security

This document explains the security model of Mini-CRM, with a focus on how user data is isolated.

## Threat Model

The primary security concern for a multi-tenant CRM is **cross-user data leakage**: user A should never be able to read, update, or delete user B's contacts.

We defend against this at multiple layers:

1. **Authentication** — Supabase Auth issues a signed JWT per session. Every request carries this token.
2. **Authorization (RLS)** — Postgres Row Level Security policies enforce per-user scoping at the database layer.
3. **API surface** — All mutations go through Server Actions or Route Handlers. The browser never writes directly to the database.

## Row Level Security (RLS)

RLS is a Postgres feature that attaches a boolean policy to every row operation. When RLS is enabled on a table, **the database itself** filters rows — not the application code.

RLS is enabled on the `contacts` table:

```sql
alter table public.contacts enable row level security;