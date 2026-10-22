import { supabase } from "./supabase";


async function compressArticleImage(file) {
  const image = await new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const element = new Image();

    element.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(element);
    };

    element.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la foto seleccionada."));
    };

    element.src = objectUrl;
  });

  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar la foto.");

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => result
        ? resolve(result)
        : reject(new Error("No se pudo comprimir la foto.")),
      "image/jpeg",
      0.82,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${Date.now()}-${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}


export async function uploadArticleImage(file) {

  if (!file) return null;


  let compressedFile;

  try {

    compressedFile = await compressArticleImage(file);

  }
  catch (error) {

    console.error("ERROR PROCESANDO IMAGEN:", error);

    return null;

  }


  const fileName = compressedFile.name;


  const { error } = await supabase
    .storage
    .from("articulos")
    .upload(fileName, compressedFile, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
    });



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
