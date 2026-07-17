import { supabase } from "./supabase";


export async function uploadArticleImage(file) {

  if (!file) return null;


  const fileName = `${Date.now()}-${file.name}`;


  const { error } = await supabase
    .storage
    .from("articulos")
    .upload(fileName, file);



  if (error) {

    console.error("ERROR SUBIENDO IMAGEN:", error);

    return null;

  }



  const { data } = supabase
    .storage
    .from("articulos")
    .getPublicUrl(fileName);



  return data.publicUrl;

}