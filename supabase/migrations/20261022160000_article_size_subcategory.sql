-- Optional product attributes for size and a more detailed category.
-- Existing articles remain valid and keep NULL until edited/recreated.
alter table public.articulos
  add column if not exists talla text,
  add column if not exists subcategoria text;
