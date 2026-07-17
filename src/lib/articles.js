import { supabase } from "./supabase";




// Obtener artículos

export async function getArticles() {


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

    return [];

  }



  return data;


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



  const codigo = await generateArticleCode();




  const { data,error } = await supabase

    .from("articulos")

    .insert([

      {

        descripcion:article.descripcion,

        categoria:article.categoria,

        precio:article.precio,

        codigo,

        foto:article.foto || null,

        estado:"Disponible",

        cliente:article.cliente || null,

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







// Confirmar venta

export async function confirmSale(venta){


  const { data,error } = await supabase

    .from("articulos")

    .update({

      estado:"Vendido",

      precio_venta:Number(
        venta.precio_venta
      ),

      metodo_pago:venta.metodo_pago,

      fecha_venta:new Date(),

    })

    .eq(
      "id",
      venta.id
    )

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







// Eliminar artículo

export async function deleteArticle(id){


  const { error } = await supabase

    .from("articulos")

    .delete()

    .eq(
      "id",
      id
    );



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


  const { data, error } = await supabase

    .from("articulos")

    .update({

      estado:"Liquidado",

    })

    .eq(
      "cliente",
      clienteId
    )

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