begin;

alter table public.gastos
  add column if not exists compartido boolean not null default false,
  add column if not exists pagado_por uuid references auth.users(id) on delete set null;

-- Preserve existing records: assume the person who registered an older expense paid it.
update public.gastos
set pagado_por = owner_id
where pagado_por is null;

commit;
