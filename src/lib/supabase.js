import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kkqpjaucqlkjeczgmisf.supabase.co";

const supabaseKey = "sb_publishable_iqz3ZykCJIOteJiTZvfFEQ_af5OwmaW";

export const supabase = createClient(supabaseUrl, supabaseKey);
