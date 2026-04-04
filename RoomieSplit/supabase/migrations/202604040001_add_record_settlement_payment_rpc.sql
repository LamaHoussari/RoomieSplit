create or replace function public.record_settlement_payment(
  p_settlement_id uuid,
  p_amount numeric
)
returns public.settlements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settlement public.settlements%rowtype;
  v_user_id uuid := auth.uid();
  v_amount numeric(12, 2);
  v_remaining numeric(12, 2);
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  v_amount := round(coalesce(p_amount, 0)::numeric, 2);

  if v_amount <= 0 then
    raise exception 'Enter a valid payment amount.';
  end if;

  select *
  into v_settlement
  from public.settlements
  where id = p_settlement_id
  for update;

  if not found then
    raise exception 'Balance not found.';
  end if;

  if v_settlement.archived_at is not null then
    raise exception 'Archived balances cannot be paid.';
  end if;

  if v_settlement.from_user_id <> v_user_id then
    raise exception 'Only the member who owes this balance can record its payment.';
  end if;

  v_remaining := round(
    greatest(0, coalesce(v_settlement.amount, 0) - coalesce(v_settlement.paid, 0))::numeric,
    2
  );

  if v_amount > v_remaining then
    raise exception 'Payment amount cannot exceed the remaining settlement balance.';
  end if;

  update public.settlements
  set paid = round((coalesce(v_settlement.paid, 0) + v_amount)::numeric, 2)
  where id = p_settlement_id
  returning *
  into v_settlement;

  return v_settlement;
end;
$$;

revoke all on function public.record_settlement_payment(uuid, numeric) from public;
grant execute on function public.record_settlement_payment(uuid, numeric) to authenticated;
