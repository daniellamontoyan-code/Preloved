import { useEffect, useState } from "react";
import { ChevronLeft, Pencil, Shirt } from "lucide-react";

import DetalleArticulo from "./DetalleArticulo";
import EditClientSheet from "../components/EditClientSheet";

import { getArticles } from "../lib/articles";
import { getLastLiquidacion } from "../lib/liquidaciones";



export default function DetalleCliente({

  cliente,
  onBack,

}) {


  const [articulos, setArticulos] = useState([]);

  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  const [clienteActual, setClienteActual] = useState(cliente);

  const [showEdit, setShowEdit] = useState(false);


  const [ultimaLiquidacion, setUltimaLiquidacion] = useState(null);







  useEffect(()=>{

    cargarDatos();

  },[]);







  async function cargarDatos(){


    const articulosData = await getArticles();



    const lista = articulosData.filter(

      articulo => articulo.cliente === clienteActual.id

    );



    setArticulos(lista);





    const liquidacion = await getLastLiquidacion(

      clienteActual.id

    );


    setUltimaLiquidacion(liquidacion);



  }







  if(articuloSeleccionado){


    return (

      <DetalleArticulo

        articulo={articuloSeleccionado}

        onBack={()=>{

          setArticuloSeleccionado(null);

          cargarDatos();

        }}

      />

    );


  }









  return (

    <div

      style={{

        minHeight:"100vh",

        background:"#F5EBDD",

        padding:"60px 20px 120px",

        maxWidth:"430px",

        margin:"0 auto",

      }}

    >







      <div

        style={{

          display:"flex",

          alignItems:"center",

          marginBottom:"30px",

        }}

      >



        <button

          onClick={onBack}

          style={{

            width:"40px",

            height:"40px",

            borderRadius:"50%",

            border:"none",

            background:"#F5EBDD",

            display:"flex",

            alignItems:"center",

            justifyContent:"center",

          }}

        >

          <ChevronLeft size={22}/>

        </button>







        <h1

          style={{

            margin:"0 0 0 14px",

            flex:1,

            fontSize:"26px",

            fontWeight:"800",

            color:"#383B3B",

          }}

        >

          {clienteActual.nombre}

        </h1>







        <button

          onClick={()=>setShowEdit(true)}

          style={{

            width:"42px",

            height:"42px",

            borderRadius:"50%",

            border:"none",

            background:"#FFC9E3",

            color:"#8B1E2D",

            display:"flex",

            alignItems:"center",

            justifyContent:"center",

          }}

        >

          <Pencil size={20}/>

        </button>



      </div>









      <InfoCard

        titulo="COMISIÓN"

        valor={`${clienteActual.porcentaje_comision}%`}

      />








      <InfoCard

        titulo="ÚLTIMA LIQUIDACIÓN"

        valor={

          ultimaLiquidacion

          ? new Date(

              ultimaLiquidacion.fecha_liquidacion

            ).toLocaleDateString()

          : "Sin liquidaciones"

        }

      />








      <InfoCard

        titulo="MONTO LIQUIDADO"

        valor={

          ultimaLiquidacion

          ? `S/. ${ultimaLiquidacion.monto_total}`

          : "S/. 0"

        }

      />









      <div

        style={{

          marginTop:"35px",

          marginBottom:"18px",

          display:"flex",

          alignItems:"center",

          gap:"8px",

        }}

      >


        <Shirt

          size={24}

          color="#8B1E2D"

        />



        <h2

          style={{

            margin:0,

            fontSize:"22px",

            fontWeight:"800",

          }}

        >

          Artículos

        </h2>


      </div>









      <div

        style={{

          display:"flex",

          flexDirection:"column",

          gap:"16px",

        }}

      >




      {

        articulos.length > 0 ? (


          articulos.map(item=>(


            <button

              key={item.id}

              onClick={()=>{

                setArticuloSeleccionado(item);

              }}


              style={{

                width:"100%",

                background:"#FFFFFF",

                borderRadius:"24px",

                border:

                  item.estado === "Disponible"

                  ? "1px solid #BBF7D0"

                  :

                  item.estado === "Vendido"

                  ? "1px solid #FECACA"

                  :

                  "1px solid #E5E7EB",



                padding:"16px",

                display:"flex",

                alignItems:"center",

                gap:"14px",

                boxShadow:

                  item.estado === "Disponible"

                  ? "0 10px 30px rgba(34,197,94,.18)"

                  :

                  item.estado === "Vendido"

                  ? "0 10px 30px rgba(239,68,68,.18)"

                  :

                  "0 10px 30px rgba(0,0,0,.06)",


                cursor:"pointer",

                textAlign:"left",

              }}

            >





              <div

                style={{

                  width:"80px",

                  height:"80px",

                  borderRadius:"18px",

                  background:"#FFC9E3",

                  overflow:"hidden",

                  flexShrink:0,

                }}

              >

                {
                  item.foto && (

                    <img

                      src={item.foto}

                      style={{

                        width:"100%",

                        height:"100%",

                        objectFit:"cover",

                      }}

                    />

                  )
                }


              </div>









              <div

                style={{

                  flex:1,

                }}

              >

                <strong

                  style={{

                    fontSize:"18px",

                    color:"#383B3B",

                  }}

                >

                  {item.descripcion}

                </strong>



                <div

                  style={{

                    marginTop:"6px",

                    color:"#8B8B99",

                    fontSize:"15px",

                  }}

                >

                  {item.categoria}

                </div>


              </div>








              <strong

                style={{

                  fontSize:"20px",

                  color:"#8B1E2D",

                }}

              >

                S/. {item.precio_venta || item.precio || 0}

              </strong>





            </button>


          ))



        ) : (



          <div

            style={{

              background:"#FFFFFF",

              borderRadius:"22px",

              padding:"30px",

              textAlign:"center",

              color:"#777",

            }}

          >

            No tiene artículos registrados


          </div>


        )

      }



      </div>









      {

        showEdit && (

          <EditClientSheet

            cliente={clienteActual}


            onClose={()=>{

              setShowEdit(false);

            }}



            onUpdated={(actualizado)=>{

              setClienteActual(actualizado);

            }}



            onDeleted={()=>{

              onBack();

            }}


          />

        )

      }






    </div>

  );

}








function InfoCard({

  titulo,

  valor,

}) {


return (

<div

style={{

background:"#FFFFFF",

borderRadius:"24px",

padding:"18px",

marginBottom:"16px",

boxShadow:"0 10px 30px rgba(0,0,0,.05)",

}}

>


<span

style={{

display:"block",

fontSize:"12px",

fontWeight:"700",

color:"#8B8B99",

letterSpacing:"1px",

marginBottom:"10px",

}}

>

{titulo}

</span>



<div

style={{

display:"inline-flex",

padding:"10px 16px",

borderRadius:"18px",

background:"#FFC9E3",

color:"#8B1E2D",

fontSize:"18px",

fontWeight:"800",

}}

>

{valor}

</div>



</div>

);


}