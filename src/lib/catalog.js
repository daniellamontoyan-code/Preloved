import { supabase } from "./supabase";

export async function getPublicCatalog() {
  const { data, error } = await supabase.rpc("get_public_catalog");
  if (error) {
    console.error("No se pudo cargar el catálogo público:", error);
    return { articles: [], error };
  }

  return { articles: data || [], error: null };
}
