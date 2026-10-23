import { getCurrentUserId, supabase } from "./supabase";
import { signArticleImages } from "./storage";

const CATALOG_CACHE_KEY = "cherry_catalog_cache";
const PENDING_SALES_KEY = "cherry_pending_sales";

function readPendingSales(ownerId) {
  if (!ownerId) return [];
  try { return JSON.parse(localStorage.getItem(`${PENDING_SALES_KEY}_${ownerId}`) || "[]"); }
  catch { return []; }
}

function writePendingSales(ownerId, sales) {
  if (!ownerId) return;
  localStorage.setItem(`${PENDING_SALES_KEY}_${ownerId}`, JSON.stringify(sales));
  window.dispatchEvent(new Event("cherry-pending-sales"));
}

export function getPendingSales(ownerId) { return readPendingSales(ownerId); }

function withPendingSales(articles, ownerId) {
  const ids = new Set(readPendingSales(ownerId).map((sale) => String(sale.id)));
  return (articles || []).map((article) => ids.has(String(article.id))
    ? { ...article, estado: "Vendido", pendiente_sync: true }
    : article);
}




// Obtener artículos

export async function getArticles() {

  const ownerId = await getCurrentUserId();
  if (!ownerId) return [];
  const catalogCacheKey = `${CATALOG_CACHE_KEY}_${ownerId}`;


  const { data, error } = await supabase

    .from("articulos")

    .select("*")

    .order(
      "created_at",
      {
        ascending:false
      }
    );



  if(error){

    console.error(
      "ERROR OBTENIENDO ARTICULOS:",
      error
    );

    try { return withPendingSales(JSON.parse(localStorage.getItem(catalogCacheKey) || "[]"), ownerId); }
    catch { return []; }

  }



  const withSignedImages = await signArticleImages(data || []);
  localStorage.setItem(catalogCacheKey, JSON.stringify(withSignedImages));
  return withPendingSales(withSignedImages, ownerId);


}






// Contar artículos

export async function getArticlesCount(){


  const { count, error } = await supabase

    .from("articulos")

    .select(
      "*",
      {
        count:"exact",
        head:true
      }
    );



  if(error){

    console.error(
      "ERROR CONTANDO ARTICULOS:",
      error
    );

    return 0;

  }



  return count || 0;


}







// Contar disponibles

export async function getAvailableArticlesCount(){


  const { count, error } = await supabase

    .from("articulos")

    .select(
      "*",
      {
        count:"exact",
        head:true
      }
    )

    .eq(
      "estado",
      "Disponible"
    );



  if(error){

    console.error(
      "ERROR CONTANDO DISPONIBLES:",
      error
    );

    return 0;

  }



  return count || 0;


}







// Contar vendidos

export async function getSoldArticlesCount(){


  const { count, error } = await supabase

    .from("articulos")

    .select(
      "*",
      {
        count:"exact",
        head:true
      }
    )

    .eq(
      "estado",
      "Vendido"
    );



  if(error){

    console.error(
      "ERROR CONTANDO VENDIDOS:",
      error
    );

    return 0;

  }



  return count || 0;


}








// Total vendido en dinero

export async function getSalesTotal(){


  const { data, error } = await supabase

    .from("articulos")

    .select(
      "precio_venta"
    )

    .eq(
      "estado",
      "Vendido"
    );



  if(error){

    console.error(
      "ERROR OBTENIENDO VENTAS:",
      error
    );

    return 0;

  }




  return data.reduce(

    (total,item)=>{

      return total + Number(
        item.precio_venta || 0
      );

    },

    0

  );


}








// Ventas por método de pago

export async function getPaymentSummary(){


  const { data, error } = await supabase

    .from("articulos")

    .select(
      "metodo_pago, precio_venta"
    )

    .eq(
      "estado",
      "Vendido"
    );




  if(error){

    console.error(
      "ERROR OBTENIENDO METODOS DE PAGO:",
      error
    );

    return {};

  }






  const resumen = {};



  data.forEach(item=>{


    const metodo = item.metodo_pago || "Otros";



    if(!resumen[metodo]){

      resumen[metodo] = 0;

    }



    resumen[metodo] += Number(
      item.precio_venta || 0
    );


  });




  return resumen;


}








// Generar código

export async function generateArticleCode(){


  const { count, error } = await supabase

    .from("articulos")

    .select(
      "*",
      {
        count:"exact",
        head:true
      }
    );



  if(error){

    return "PR-0001";

  }



  const numero = (count || 0)+1;



  return `PR-${String(numero).padStart(4,"0")}`;


}







// Crear artículo

export async function createArticle(article){

  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;


  const codigo = await generateArticleCode();




  const { data,error } = await supabase

    .from("articulos")

    .insert([

      {

        descripcion:article.descripcion,

        categoria:article.categoria,
        subcategoria:article.subcategoria || null,
        talla:article.talla?.trim() || null,
        publico_objetivo:article.publico_objetivo || null,

        precio:article.precio,
        precio_web:article.precio_web,
        publicar_feria:article.publicar_feria,
        publicar_web:article.publicar_web,

        codigo,

        foto:article.foto || null,

        estado:"Disponible",

        cliente:article.cliente || null,
        owner_id:ownerId,

      }

    ])

    .select("*")

    .single();





  if(error){

    console.error(
      error
    );

    return null;

  }



  return data;


}

export async function updateArticle(id, article) {
  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;

  const { data, error } = await supabase
    .from("articulos")
    .update({
      descripcion: article.descripcion,
      categoria: article.categoria || null,
      subcategoria: article.subcategoria || null,
      talla: article.talla?.trim() || null,
      publico_objetivo: article.publico_objetivo || null,
      cliente: article.cliente || null,
      precio: Number(article.precio) || 0,
      precio_web: Number(article.precio_web) || 0,
      publicar_feria: article.publicar_feria !== false,
      publicar_web: article.publicar_web !== false,
      foto: article.foto || null,
    })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("ERROR ACTUALIZANDO ARTÍCULO:", error);
    return null;
  }

  return data;
}







// Confirmar venta

export async function confirmSale(venta){

  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;

  if (!navigator.onLine) {
    const pending = readPendingSales(ownerId);
    if (pending.some((sale) => String(sale.id) === String(venta.id))) {
      return { ...venta, estado: "Vendido", pendiente_sync: true };
    }
    pending.push({ ...venta, owner_id:ownerId, fecha_venta: new Date().toISOString(), queued_at: Date.now() });
    writePendingSales(ownerId, pending);
    return { ...venta, estado: "Vendido", pendiente_sync: true };
  }


  const { data,error } = await supabase

    .from("articulos")

    .update({

      estado:"Vendido",

      precio_venta:Number(
        venta.precio_venta
      ),

      canal_venta:venta.canal_venta,

      metodo_pago:venta.metodo_pago,

      fecha_venta:new Date(),

    })

    .eq(
      "id",
      venta.id
    )
    .eq("estado", "Disponible")
    .eq("owner_id", ownerId)

    .select("*")

    .maybeSingle();





  if(error || !data){

    console.error(
      error
    );

    alert("Esta prenda ya no aparece como disponible o no se pudo guardar. Actualiza la lista y vuelve a revisar la venta.");
    return null;

  }



  return data;


}

export async function syncPendingSales() {
  const ownerId = await getCurrentUserId();
  if (!ownerId) return { synced: 0, failed: 0, conflicts: 0 };
  if (!navigator.onLine) return { synced: 0, failed: getPendingSales(ownerId).length };
  const pending = readPendingSales(ownerId);
  let synced = 0;
  let conflicts = 0;
  const remaining = [];
  for (const sale of pending) {
    const { data, error } = await supabase.from("articulos").update({
      estado: "Vendido", precio_venta: Number(sale.precio_venta),
      canal_venta: sale.canal_venta, metodo_pago: sale.metodo_pago, fecha_venta: sale.fecha_venta,
    }).eq("id", sale.id).eq("owner_id", ownerId).eq("estado", "Disponible").select("id").maybeSingle();
    if (!error && data) synced += 1;
    else if (error) remaining.push(sale);
    else conflicts += 1;
    // Si ya figura vendida, no se reintenta: evita duplicar la venta entre dispositivos.
  }
  writePendingSales(ownerId, remaining);
  return { synced, failed: remaining.length, conflicts };
}







// Eliminar artículo

export async function deleteArticle(id){

  const ownerId = await getCurrentUserId();
  if (!ownerId) return false;


  const { error } = await supabase

    .from("articulos")

    .delete()

    .eq(
      "id",
      id
    )
    .eq("owner_id", ownerId);



  if(error){

    console.error(
      error
    );

    return false;

  }



  return true;


}

// Liquidar artículos de un cliente

export async function liquidarArticulosCliente(clienteId){

  const ownerId = await getCurrentUserId();
  if (!ownerId) return [];


  const { data, error } = await supabase

    .from("articulos")

    .update({

      estado:"Liquidado",

    })

    .eq(
      "cliente",
      clienteId
    )
    .eq("owner_id", ownerId)

    .eq(
      "estado",
      "Vendido"
    )

    .select("*");




  if(error){

    console.error(
      "ERROR LIQUIDANDO ARTICULOS:",
      error
    );

    return false;

  }



  return data;

}
