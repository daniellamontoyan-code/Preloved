import { supabase } from "./supabase";


export async function loginUsuario(nombre, password){


  const { data, error } = await supabase

    .from("usuarios")

    .select("*")

    .eq("nombre", nombre)

    .eq("password", password)

    .single();



  if(error){

    console.error(
      "ERROR LOGIN USUARIO:",
      error
    );

    return null;

  }



  return data;


}