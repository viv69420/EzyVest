-- Retry-safe order identities. Existing data remains intact.
alter table public.paper_orders add column if not exists client_order_id uuid;
create unique index if not exists paper_orders_account_client_order_uidx on public.paper_orders(account_id, client_order_id) where client_order_id is not null;

create or replace function public.execute_paper_order(p_security_id uuid, p_side text, p_quantity numeric, p_execution_price numeric, p_client_order_id uuid default null)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare v_user uuid:=auth.uid(); v_account public.paper_accounts%rowtype; v_position public.paper_positions%rowtype; v_cost numeric; v_realized numeric:=0; v_order_id uuid:=gen_random_uuid(); v_existing uuid;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_side not in ('buy','sell') or p_quantity is null or p_quantity<=0 or p_execution_price is null or p_execution_price<=0 then raise exception 'invalid paper order'; end if;
  if not exists(select 1 from public.securities where id=p_security_id and active) then raise exception 'security unavailable'; end if;
  insert into public.paper_accounts(user_id,cash_balance) values(v_user,100000) on conflict(user_id) do nothing;
  select * into v_account from public.paper_accounts where user_id=v_user for update;
  if p_client_order_id is not null then select id into v_existing from public.paper_orders where account_id=v_account.id and client_order_id=p_client_order_id; if v_existing is not null then return jsonb_build_object('order_id',v_existing,'status','filled','duplicate',true); end if; end if;
  v_cost:=p_quantity*p_execution_price;
  select * into v_position from public.paper_positions where account_id=v_account.id and security_id=p_security_id for update;
  if p_side='buy' then
    if v_account.cash_balance<v_cost then raise exception 'insufficient paper cash'; end if;
    update public.paper_accounts set cash_balance=cash_balance-v_cost where id=v_account.id;
    insert into public.paper_positions(account_id,security_id,quantity,average_cost) values(v_account.id,p_security_id,p_quantity,p_execution_price) on conflict(account_id,security_id) do update set average_cost=((public.paper_positions.quantity*public.paper_positions.average_cost)+(excluded.quantity*excluded.average_cost))/(public.paper_positions.quantity+excluded.quantity),quantity=public.paper_positions.quantity+excluded.quantity,updated_at=now();
  else
    if not found or v_position.quantity<p_quantity then raise exception 'insufficient paper shares'; end if;
    v_realized:=(p_execution_price-v_position.average_cost)*p_quantity;
    update public.paper_accounts set cash_balance=cash_balance+v_cost where id=v_account.id;
    update public.paper_positions set quantity=quantity-p_quantity,realized_pnl=realized_pnl+v_realized,updated_at=now() where id=v_position.id;
    delete from public.paper_positions where id=v_position.id and quantity=0;
  end if;
  insert into public.paper_orders(id,account_id,security_id,side,quantity,execution_price,status,client_order_id) values(v_order_id,v_account.id,p_security_id,p_side,p_quantity,p_execution_price,'filled',p_client_order_id);
  insert into public.paper_transactions(order_id,account_id,transaction_type,amount) values(v_order_id,v_account.id,p_side,case when p_side='buy' then -v_cost else v_cost end);
  return jsonb_build_object('order_id',v_order_id,'status','filled','realized_pnl',v_realized);
end $$;
