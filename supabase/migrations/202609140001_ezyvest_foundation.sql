-- EzyVest foundation. This migration is deliberately re-runnable and never replaces
-- an existing profile record/table from another application in this Supabase project.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.exchanges (id uuid primary key default gen_random_uuid(), name text not null, mic text unique, country_code text, currency_code text, created_at timestamptz not null default now());
create table if not exists public.companies (id uuid primary key default gen_random_uuid(), legal_name text not null, description text, country_code text, website text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.securities (id uuid primary key default gen_random_uuid(), company_id uuid references public.companies(id), exchange_id uuid references public.exchanges(id), symbol text not null, security_type text not null default 'equity', currency_code text, active boolean not null default true, created_at timestamptz not null default now(), unique(exchange_id, symbol, security_type));
create table if not exists public.company_identifiers (id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade, identifier_type text not null, identifier_value text not null, unique(identifier_type, identifier_value));
create table if not exists public.market_prices (id uuid primary key default gen_random_uuid(), security_id uuid not null references public.securities(id) on delete cascade, price numeric(20,6) not null check(price >= 0), previous_close numeric(20,6), volume bigint, observed_at timestamptz not null, provider text not null, created_at timestamptz not null default now(), unique(security_id, observed_at, provider));
create table if not exists public.historical_prices (id uuid primary key default gen_random_uuid(), security_id uuid not null references public.securities(id) on delete cascade, observed_on date not null, open numeric(20,6), high numeric(20,6), low numeric(20,6), close numeric(20,6) not null, volume bigint, provider text not null, unique(security_id, observed_on, provider));
create table if not exists public.financial_statements (id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), filing_id text, statement_type text not null, period_start date, period_end date not null, fiscal_year int, fiscal_quarter int, currency_code text, source_url text, created_at timestamptz not null default now());
create table if not exists public.financial_metrics (id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), metric_key text not null, value numeric, unit text, period_end date, source_statement_id uuid references public.financial_statements(id), unique(company_id, metric_key, period_end));
create table if not exists public.filings (id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), filing_type text not null, filed_at date, accession_number text unique, source_url text not null, title text, created_at timestamptz not null default now());
create table if not exists public.sources (id uuid primary key default gen_random_uuid(), company_id uuid references public.companies(id), title text not null, publisher text not null, url text not null unique, source_type text not null, published_at timestamptz, retrieved_at timestamptz not null default now(), reliability smallint not null default 3 check(reliability between 1 and 5));
create table if not exists public.news_events (id uuid primary key default gen_random_uuid(), company_id uuid references public.companies(id), source_id uuid references public.sources(id), headline text not null, occurred_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.research_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, title text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.research_messages (id uuid primary key default gen_random_uuid(), session_id uuid not null references public.research_sessions(id) on delete cascade, role text not null check(role in ('user','assistant','system')), content jsonb not null, created_at timestamptz not null default now());
create table if not exists public.theses (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, security_id uuid references public.securities(id), title text not null, statement text not null, invalidation_conditions text, catalysts text, status text not null default 'draft' check(status in ('draft','active','invalidated','closed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.thesis_evidence (id uuid primary key default gen_random_uuid(), thesis_id uuid not null references public.theses(id) on delete cascade, source_id uuid references public.sources(id), stance text not null check(stance in ('supports','contradicts')), note text not null, created_at timestamptz not null default now());
create table if not exists public.paper_accounts (id uuid primary key default gen_random_uuid(), user_id uuid not null unique references public.profiles(id) on delete cascade, base_currency text not null default 'USD', cash_balance numeric(20,6) not null default 0 check(cash_balance >= 0), created_at timestamptz not null default now());
create table if not exists public.paper_orders (id uuid primary key default gen_random_uuid(), account_id uuid not null references public.paper_accounts(id) on delete cascade, security_id uuid not null references public.securities(id), side text not null check(side in ('buy','sell')), quantity numeric(20,6) not null check(quantity > 0), execution_price numeric(20,6) not null check(execution_price > 0), status text not null default 'filled' check(status in ('pending','filled','rejected','cancelled')), created_at timestamptz not null default now());
create table if not exists public.paper_positions (id uuid primary key default gen_random_uuid(), account_id uuid not null references public.paper_accounts(id) on delete cascade, security_id uuid not null references public.securities(id), quantity numeric(20,6) not null check(quantity >= 0), average_cost numeric(20,6) not null check(average_cost >= 0), realized_pnl numeric(20,6) not null default 0, updated_at timestamptz not null default now(), unique(account_id, security_id));
create table if not exists public.paper_transactions (id uuid primary key default gen_random_uuid(), order_id uuid references public.paper_orders(id), account_id uuid not null references public.paper_accounts(id), transaction_type text not null, amount numeric(20,6) not null, occurred_at timestamptz not null default now());
create table if not exists public.watchlists (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, name text not null default 'Watchlist', created_at timestamptz not null default now(), unique(user_id, name));
create table if not exists public.watchlist_items (watchlist_id uuid references public.watchlists(id) on delete cascade, security_id uuid references public.securities(id) on delete cascade, created_at timestamptz not null default now(), primary key(watchlist_id, security_id));

create index if not exists market_prices_security_observed_idx on public.market_prices(security_id, observed_at desc);
create index if not exists historical_prices_security_observed_idx on public.historical_prices(security_id, observed_on desc);
create index if not exists filings_company_filed_idx on public.filings(company_id, filed_at desc);
create index if not exists research_sessions_user_updated_idx on public.research_sessions(user_id, updated_at desc);
create index if not exists paper_orders_account_created_idx on public.paper_orders(account_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.research_sessions enable row level security;
alter table public.research_messages enable row level security;
alter table public.theses enable row level security;
alter table public.thesis_evidence enable row level security;
alter table public.paper_accounts enable row level security;
alter table public.paper_orders enable row level security;
alter table public.paper_positions enable row level security;
alter table public.paper_transactions enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;

-- PostgreSQL has no CREATE POLICY IF NOT EXISTS. The guard makes policies safe
-- after a partial run while leaving any pre-existing project policies untouched.
do $$
declare p record;
begin
  for p in select * from (values
    ('profiles', 'ezyvest_profiles_own', 'for all using (id = auth.uid()) with check (id = auth.uid())'),
    ('research_sessions', 'ezyvest_sessions_own', 'for all using (user_id = auth.uid()) with check (user_id = auth.uid())'),
    ('research_messages', 'ezyvest_messages_own', 'for all using (exists (select 1 from public.research_sessions s where s.id = session_id and s.user_id = auth.uid())) with check (exists (select 1 from public.research_sessions s where s.id = session_id and s.user_id = auth.uid()))'),
    ('theses', 'ezyvest_theses_own', 'for all using (user_id = auth.uid()) with check (user_id = auth.uid())'),
    ('thesis_evidence', 'ezyvest_thesis_evidence_own', 'for all using (exists (select 1 from public.theses t where t.id = thesis_id and t.user_id = auth.uid())) with check (exists (select 1 from public.theses t where t.id = thesis_id and t.user_id = auth.uid()))'),
    ('paper_accounts', 'ezyvest_accounts_own', 'for all using (user_id = auth.uid()) with check (user_id = auth.uid())'),
    ('paper_orders', 'ezyvest_orders_own', 'for all using (exists (select 1 from public.paper_accounts a where a.id = account_id and a.user_id = auth.uid())) with check (exists (select 1 from public.paper_accounts a where a.id = account_id and a.user_id = auth.uid()))'),
    ('paper_positions', 'ezyvest_positions_own', 'for all using (exists (select 1 from public.paper_accounts a where a.id = account_id and a.user_id = auth.uid())) with check (exists (select 1 from public.paper_accounts a where a.id = account_id and a.user_id = auth.uid()))'),
    ('paper_transactions', 'ezyvest_transactions_own', 'for all using (exists (select 1 from public.paper_accounts a where a.id = account_id and a.user_id = auth.uid())) with check (exists (select 1 from public.paper_accounts a where a.id = account_id and a.user_id = auth.uid()))'),
    ('watchlists', 'ezyvest_watchlists_own', 'for all using (user_id = auth.uid()) with check (user_id = auth.uid())'),
    ('watchlist_items', 'ezyvest_watchlist_items_own', 'for all using (exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid())) with check (exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid()))')
  ) as rules(table_name, policy_name, policy_sql)
  loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = p.table_name and policyname = p.policy_name) then
      execute format('create policy %I on public.%I %s', p.policy_name, p.table_name, p.policy_sql);
    end if;
  end loop;
end $$;

-- Atomic, user-scoped immediate paper execution. The client never supplies balances.
create or replace function public.execute_paper_order(
  p_security_id uuid, p_side text, p_quantity numeric, p_execution_price numeric
) returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_account public.paper_accounts%rowtype; v_position public.paper_positions%rowtype;
  v_cost numeric; v_realized numeric := 0; v_order_id uuid := gen_random_uuid();
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_side not in ('buy','sell') or p_quantity is null or p_quantity <= 0 or p_execution_price is null or p_execution_price <= 0 then raise exception 'invalid paper order'; end if;
  if not exists (select 1 from public.securities where id = p_security_id and active) then raise exception 'security unavailable'; end if;
  insert into public.paper_accounts (user_id, cash_balance) values (v_user, 100000)
    on conflict (user_id) do nothing;
  select * into v_account from public.paper_accounts where user_id = v_user for update;
  v_cost := p_quantity * p_execution_price;
  select * into v_position from public.paper_positions where account_id = v_account.id and security_id = p_security_id for update;
  if p_side = 'buy' then
    if v_account.cash_balance < v_cost then raise exception 'insufficient paper cash'; end if;
    update public.paper_accounts set cash_balance = cash_balance - v_cost where id = v_account.id;
    insert into public.paper_positions(account_id,security_id,quantity,average_cost) values(v_account.id,p_security_id,p_quantity,p_execution_price)
      on conflict(account_id,security_id) do update set average_cost=((public.paper_positions.quantity*public.paper_positions.average_cost)+(excluded.quantity*excluded.average_cost))/(public.paper_positions.quantity+excluded.quantity),quantity=public.paper_positions.quantity+excluded.quantity,updated_at=now();
  else
    if not found or v_position.quantity < p_quantity then raise exception 'insufficient paper shares'; end if;
    v_realized := (p_execution_price-v_position.average_cost)*p_quantity;
    update public.paper_accounts set cash_balance = cash_balance + v_cost where id = v_account.id;
    update public.paper_positions set quantity=quantity-p_quantity,realized_pnl=realized_pnl+v_realized,updated_at=now() where id=v_position.id;
    delete from public.paper_positions where id=v_position.id and quantity=0;
  end if;
  insert into public.paper_orders(id,account_id,security_id,side,quantity,execution_price,status) values(v_order_id,v_account.id,p_security_id,p_side,p_quantity,p_execution_price,'filled');
  insert into public.paper_transactions(order_id,account_id,transaction_type,amount) values(v_order_id,v_account.id,p_side,case when p_side='buy' then -v_cost else v_cost end);
  return jsonb_build_object('order_id',v_order_id,'status','filled','realized_pnl',v_realized);
end; $$;
