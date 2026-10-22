import { supabase } from "./supabase";

export async function getCurrentAppUser() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("No se pudo cargar el nombre de usuario de Cherry Club.", error);
    return null;
  }
  return data;
}
