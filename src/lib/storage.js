import { getCurrentUserId, supabase } from "./supabase";


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

  // Enough resolution for the catalog grid and a full-screen phone detail view,
  // while keeping uploads much smaller than the phone's original image.
  const maxSide = 1200;
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
      0.72,
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


  const userId = await getCurrentUserId();
  if (!userId) return null;
  const fileName = `${userId}/${compressedFile.name}`;


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



  return fileName;

}

export async function signArticleImages(articles) {
  const paths = [...new Set((articles || []).map(item => item.foto).filter(Boolean).filter(path => !/^https?:\/\//i.test(path)))];
  if (!paths.length) return articles || [];
  const { data, error } = await supabase.storage.from("articulos").createSignedUrls(paths, 86400);
  if (error) {
    console.error("No se pudieron cargar algunas fotos de prendas.", error);
    return articles || [];
  }
  const signedByPath = new Map((data || []).map(item => [item.path, item.signedUrl]));
  return (articles || []).map(item => item.foto && signedByPath.has(item.foto)
    ? { ...item, foto_path: item.foto, foto: signedByPath.get(item.foto) }
    : item);
}

export async function clearPrivatePhotoCache() {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type:"CLEAR_CHERRY_PRIVATE_PHOTOS" });
  } else if ("caches" in window) {
    await caches.delete("cherry-product-photos-v1");
  }
}
