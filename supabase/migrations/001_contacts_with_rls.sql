-- Create contacts table
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.contacts enable row level security;

-- RLS Policy: users can only see their own contacts
create policy "Users can view their own contacts"
  on public.contacts for select
  using (auth.uid() = user_id);

-- RLS Policy: users can only insert contacts assigned to themselves
create policy "Users can insert their own contacts"
  on public.contacts for insert
  with check (auth.uid() = user_id);

-- RLS Policy: users can only update their own contacts
create policy "Users can update their own contacts"
  on public.contacts for update
  using (auth.uid() = user_id);

-- RLS Policy: users can only delete their own contacts
create policy "Users can delete their own contacts"
  on public.contacts for delete
  using (auth.uid() = user_id);