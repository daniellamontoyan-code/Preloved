begin;

alter table public.gastos
  add column if not exists deuda_saldada_at timestamptz,
  add column if not exists deuda_saldada_por uuid references auth.users(id) on delete set null,
  add column if not exists deuda_saldada_monto numeric(12, 2);

create or replace function public.settle_shared_expense(expense_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_rows integer;
begin
  if not coalesce(public.is_cherry_member(), false) then
    raise exception 'Only Pitucas team members can settle a shared expense';
  end if;

  update public.gastos as gasto
  set deuda_saldada_at = pg_catalog.now(),
      deuda_saldada_por = (select auth.uid()),
      deuda_saldada_monto = pg_catalog.round(gasto.monto / 2, 2)
  where gasto.id = expense_id
    and gasto.compartido = true
    and gasto.deuda_saldada_at is null
    and gasto.pagado_por is not null;

  get diagnostics updated_rows = row_count;
  return updated_rows = 1;
end;
$$;

revoke all on function public.settle_shared_expense(uuid) from public, anon;
grant execute on function public.settle_shared_expense(uuid) to authenticated;

commit;
