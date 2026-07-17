import { supabase } from "./supabase";



// Obtener clientes
export async function getClients() {


  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", {
      ascending:false
    });



  if(error){

    console.error(
      "ERROR OBTENIENDO CLIENTES:",
      error
    );

    return [];

  }



  return data;

}







// Crear cliente
export async function createClient(cliente) {


  console.log(
    "DATOS QUE ENVÍO A SUPABASE:",
    cliente
  );



  const { data, error } = await supabase
    .from("clientes")
    .insert([
      {
        nombre:cliente.nombre,

        telefono:cliente.telefono,

        porcentaje_comision:
          Number(cliente.porcentaje_comision),

      }
    ])
    .select()
    .single();





  if(error){

    console.error(
      "ERROR CREANDO CLIENTE:",
      error
    );

    return null;

  }




  console.log(
    "CLIENTE CREADO:",
    data
  );



  return data;

}







// Actualizar cliente
export async function updateClient(id, cliente){


  const { data, error } = await supabase
    .from("clientes")
    .update({

      nombre:cliente.nombre,

      telefono:cliente.telefono,

      porcentaje_comision:
        Number(cliente.porcentaje_comision),

    })
    .eq(
      "id",
      id
    )
    .select()
    .single();





  if(error){

    console.error(
      "ERROR ACTUALIZANDO CLIENTE:",
      error
    );

    return null;

  }



  return data;

}







// Eliminar cliente
export async function deleteClient(id){


  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq(
      "id",
      id
    );




  if(error){

    console.error(
      "ERROR ELIMINANDO CLIENTE:",
      error
    );

    return false;

  }



  return true;

}