import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kkqpjaucqlkjeczgmisf.supabase.co";

const supabaseKey = "sb_publishable_iqz3ZykCJIOteJiTZvfFEQ_af5OwmaW";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCurrentUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || null;
}
