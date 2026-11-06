import { getCurrentUserId, supabase } from "./supabase";

import { getClients } from "./clients";
import { getArticles } from "./articles";
import { getCurrentAppUser } from "./usuarios";
import { commissionShares } from "./commission";





export async function getLiquidaciones(){


  const [clientes, articulos, usuario] = await Promise.all([
    getClients(),
    getArticles(),
    getCurrentAppUser(),
  ]);





  const clientesLiquidacion = clientes.map(cliente=>{


    const articulosCliente = articulos.filter(

      articulo => 

        articulo.cliente === cliente.id &&

        articulo.estado === "Vendido"

    );





    const totalVenta = articulosCliente.reduce(

      (total, articulo)=>{


        return total + Number(

          articulo.precio_venta || articulo.precio || 0

        );


      },

      0

    );





    const porcentaje = Number(

      cliente.porcentaje_comision || 0

    );





    const comision = totalVenta * (

      porcentaje / 100

    );





    const liquidar = totalVenta - comision;





    const { dani:comisionDani, mafer:comisionMafer } = commissionShares(
      comision,
      cliente.compartido === true,
      usuario?.nombre,
    );
    const ganancia = comision;






    return {


      id:cliente.id,

      nombre:cliente.nombre,

      porcentaje,

      compartido:cliente.compartido === true,

      comisionTitular:usuario?.nombre || "esta cuenta",

      articulos:articulosCliente.length,

      totalVenta,

      comision,

      comisionDani,

      comisionMafer,

      liquidar,

      ganancia,


    };



  }).filter(

    cliente => cliente.articulos > 0

  );








  const resumen = {


    clientes: clientesLiquidacion.length,


    articulos: clientesLiquidacion.reduce(

      (total, cliente)=>{

        return total + cliente.articulos;

      },

      0

    ),




    ventas: clientesLiquidacion.reduce(

      (total, cliente)=>{

        return total + cliente.totalVenta;

      },

      0

    ),





    liquidar: clientesLiquidacion.reduce(

      (total, cliente)=>{

        return total + cliente.liquidar;

      },

      0

    ),





    ganancia: clientesLiquidacion.reduce(

      (total, cliente)=>{

        return total + cliente.ganancia;

      },

      0

    ),


  };







  return {

    clientes:clientesLiquidacion,

    resumen,

  };



}









// Crear registro histórico de liquidación

export async function crearLiquidacion(cliente){

  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;



  const { data, error } = await supabase

    .from("liquidaciones")

    .insert([

      {

        cliente_id:cliente.id,

        monto_total:cliente.liquidar,

        monto_comision:cliente.comision,

        cantidad_articulos:cliente.articulos,

        fecha_liquidacion:new Date(),
        owner_id:ownerId,

      }

    ])

    .select("*")

    .single();





  if(error){


    console.error(

      "ERROR CREANDO LIQUIDACION:",

      error

    );


    return null;


  }





  return data;


}

export async function getLastLiquidacion(clienteId){

  const ownerId = await getCurrentUserId();
  if (!ownerId) return null;


  const { data, error } = await supabase

    .from("liquidaciones")

    .select("*")

    .eq(
      "cliente_id",
      clienteId
    )
    .order(
      "fecha_liquidacion",
      {
        ascending:false
      }
    )

    .limit(1)

    .single();




  if(error){

    console.error(
      "ERROR OBTENIENDO ULTIMA LIQUIDACION:",
      error
    );

    return null;

  }



  return data;


}
