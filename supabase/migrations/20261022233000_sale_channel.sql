-- Record whether a completed sale came from the fair or public web catalog.
alter table public.articulos
  add column if not exists canal_venta text;

alter table public.articulos
  drop constraint if exists articulos_canal_venta_check;

alter table public.articulos
  add constraint articulos_canal_venta_check
  check (canal_venta is null or canal_venta in ('Feria', 'Web'));
