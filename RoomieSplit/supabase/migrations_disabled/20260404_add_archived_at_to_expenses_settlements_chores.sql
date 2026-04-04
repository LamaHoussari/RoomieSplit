alter table public.expenses
add column if not exists archived_at timestamptz;

alter table public.settlements
add column if not exists archived_at timestamptz;

alter table public.chores
add column if not exists archived_at timestamptz;

create index if not exists expenses_group_archived_at_idx
on public.expenses (group_id, archived_at);

create index if not exists settlements_group_archived_at_idx
on public.settlements (group_id, archived_at);

create index if not exists settlements_expense_archived_at_idx
on public.settlements (expense_id, archived_at);

create index if not exists chores_group_archived_at_idx
on public.chores (group_id, archived_at);
