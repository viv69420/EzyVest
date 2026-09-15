-- Safe follow-up: supports the confirmed thesis state without touching user data.
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'theses_status_check' and conrelid = 'public.theses'::regclass) then
    alter table public.theses drop constraint theses_status_check;
  end if;
end $$;
alter table public.theses add constraint theses_status_check check (status in ('draft','active','confirmed','invalidated','closed'));
create index if not exists theses_user_status_updated_idx on public.theses(user_id, status, updated_at desc);
create index if not exists paper_positions_account_idx on public.paper_positions(account_id);
