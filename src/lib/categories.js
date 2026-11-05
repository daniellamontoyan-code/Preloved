import { supabase } from "./supabase";

export const DEFAULT_ARTICLE_CATEGORIES = ["Ropa", "Calzado", "Bolsos", "Accesorios"];

export async function getSharedArticleCategories() {
  const { data, error } = await supabase
    .from("categorias_articulos")
    .select("nombre")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("No se pudieron cargar las categorías compartidas:", error.message);
    return [];
  }

  return (data || []).map(({ nombre }) => nombre);
}

export async function createSharedArticleCategory(value) {
  const nombre = value.trim().replace(/\s+/g, " ");
  if (!nombre) return { category: null, error: "Escribe el nombre de la categoría." };

  const { data, error } = await supabase
    .from("categorias_articulos")
    .insert({ nombre })
    .select("nombre")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing, error: lookupError } = await supabase
        .from("categorias_articulos")
        .select("nombre")
        .ilike("nombre", nombre)
        .maybeSingle();
      if (!lookupError && existing) return { category: existing.nombre, error: null };
    }
    console.error("No se pudo guardar la categoría:", error.message);
    return { category: null, error: "No se pudo guardar. Revisa tu conexión e inténtalo otra vez." };
  }

  return { category: data.nombre, error: null };
}

export async function getSharedArticleSubcategories(categoria) {
  if (!categoria) return [];
  const { data, error } = await supabase
    .from("subcategorias_articulos")
    .select("nombre")
    .eq("categoria", categoria)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("No se pudieron cargar las subcategorías compartidas:", error.message);
    return [];
  }
  return (data || []).map(({ nombre }) => nombre);
}

export async function createSharedArticleSubcategory(categoria, value) {
  const nombre = value.trim().replace(/\s+/g, " ");
  if (!categoria) return { subcategory: null, error: "Elige una categoría primero." };
  if (!nombre) return { subcategory: null, error: "Escribe el nombre de la subcategoría." };

  const { data, error } = await supabase
    .from("subcategorias_articulos")
    .insert({ categoria, nombre })
    .select("nombre")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing, error: lookupError } = await supabase
        .from("subcategorias_articulos")
        .select("nombre")
        .eq("categoria", categoria)
        .ilike("nombre", nombre)
        .maybeSingle();
      if (!lookupError && existing) return { subcategory: existing.nombre, error: null };
    }
    console.error("No se pudo guardar la subcategoría:", error.message);
    return { subcategory: null, error: "No se pudo guardar. Revisa tu conexión e inténtalo otra vez." };
  }

  return { subcategory: data.nombre, error: null };
}
