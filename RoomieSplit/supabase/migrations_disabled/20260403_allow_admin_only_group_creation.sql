create or replace function public.create_group_with_admin_member(
  p_name text,
  p_code text,
  p_description text default null,
  p_currency text default 'USD'
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_group public.groups%rowtype;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to create a group.';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Group name is required.';
  end if;

  if p_code is null or btrim(p_code) = '' then
    raise exception 'Group code is required.';
  end if;

  insert into public.groups (
    name,
    code,
    created_by,
    description,
    currency
  )
  values (
    btrim(p_name),
    upper(btrim(p_code)),
    v_user_id,
    nullif(btrim(coalesce(p_description, '')), ''),
    coalesce(nullif(btrim(coalesce(p_currency, '')), ''), 'USD')
  )
  returning * into v_group;

  insert into public.group_members (
    group_id,
    user_id,
    role,
    nickname
  )
  values (
    v_group.id,
    v_user_id,
    'admin',
    null
  )
  on conflict (group_id, user_id) do update
    set role = excluded.role,
        nickname = excluded.nickname;

  return v_group;
end;
$$;

grant execute on function public.create_group_with_admin_member(text, text, text, text) to authenticated;
