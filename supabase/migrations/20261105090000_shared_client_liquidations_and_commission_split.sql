begin;

-- Store the Pitucas commission in each new liquidation so both members can
-- see the shared client's record and its 50/50 split.
alter table public.liquidaciones
  add column if not exists monto_comision numeric(12, 2);

drop policy if exists "read own liquidations" on public.liquidaciones;
drop policy if exists "read own or shared client liquidations" on public.liquidaciones;
create policy "read own or shared client liquidations" on public.liquidaciones
  for select to authenticated
  using (
    (select auth.uid()) = owner_id
    or (
      public.is_cherry_member()
      and exists (
        select 1
        from public.clientes as c
        where c.id = cliente_id
          and c.compartido
      )
    )
  );

commit;
