create table public.matches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  champion text not null,
  role text,
  win boolean not null,
  k_d_a text,
  lp_delta integer not null default 0,
  rank_tier text,
  notes text
);

-- Enable RLS
alter table public.matches enable row level security;

-- Allow public read access (Modify for real production use)
create policy "Allow public read access"
  on public.matches for select
  using (true);

-- Allow service role full access
create policy "Allow service role full access"
  on public.matches for all
  using (true)
  with check (true);
