begin;

alter table public.clientes
  add column if not exists color text;

with ordered_clients as (
  select id, row_number() over (order by created_at asc nulls last, id asc) as row_number
  from public.clientes
), palette as (
  select array[
    '#8B1E2D', '#E64F88', '#B77B18', '#607A35',
    '#594137', '#4D7777', '#80649A', '#496A91'
  ]::text[] as colors
)
update public.clientes as c
set color = palette.colors[((ordered_clients.row_number - 1) % pg_catalog.array_length(palette.colors, 1)) + 1]
from ordered_clients, palette
where c.id = ordered_clients.id
  and c.color is null;

alter table public.clientes
  alter column color set default '#8B1E2D',
  alter column color set not null;

drop policy if exists "read Cherry Club teammates" on public.usuarios;
drop policy if exists "read Pitucas teammates" on public.usuarios;
create policy "read Pitucas teammates" on public.usuarios
  for select to authenticated
  using (public.is_cherry_member());

commit;
