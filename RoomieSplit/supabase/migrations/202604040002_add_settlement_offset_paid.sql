alter table public.settlements
add column if not exists offset_paid numeric(12, 2) not null default 0;

update public.settlements
set offset_paid = 0
where offset_paid is null;
