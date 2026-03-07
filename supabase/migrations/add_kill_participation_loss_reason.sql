-- Run this in Supabase SQL Editor
alter table matches
  add column if not exists kill_participation integer check (kill_participation >= 0 and kill_participation <= 100),
  add column if not exists loss_reason text check (loss_reason in ('Lane diff', 'Jungle diff', 'My mistake', 'Team', 'Outscaled'));
