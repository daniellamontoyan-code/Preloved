import { getCurrentUserId, supabase } from "./supabase";



// Obtener clientes
export async function getClients() {

  const ownerId = await getCurrentUserId();
  if (!ownerId) return [];


  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("owner_id", ownerId)
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

  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;


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
        owner_id:ownerId,

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

  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;


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
    .eq("owner_id", ownerId)
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

  const ownerId = await getCurrentUserId();
  if (!ownerId) return false;


  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq(
      "id",
      id
    )
    .eq("owner_id", ownerId);




  if(error){

    console.error(
      "ERROR ELIMINANDO CLIENTE:",
      error
    );

    return false;

  }



  return true;

}
