import { useEffect, useState } from "react";
import { ChevronLeft, Pencil, Shirt } from "lucide-react";

import DetalleArticulo from "./DetalleArticulo";
import EditClientSheet from "../components/EditClientSheet";

import { getArticles } from "../lib/articles";
import { getLastLiquidacion } from "../lib/liquidaciones";

const estadoNormalizado = estado => String(estado || "").trim().toLowerCase();
const estadoOrden = estado => ({ disponible:0, vendido:1, liquidado:2 }[estadoNormalizado(estado)] ?? 3);
const estadoEtiqueta = estado => ({ disponible:"Disponible", vendido:"Vendido", liquidado:"Liquidado" }[estadoNormalizado(estado)] || estado || "Sin estado");
const estadoFondo = estado => ({ disponible:"#E8F7ED", vendido:"#FDE9E8", liquidado:"#FFF3CD" }[estadoNormalizado(estado)] || "#F0F0F0");
const estadoTexto = estado => ({ disponible:"#28733B", vendido:"#A52A2A", liquidado:"#805B00" }[estadoNormalizado(estado)] || "#594137");



export default function DetalleCliente({

  cliente,
  onBack,

}) {


  const [articulos, setArticulos] = useState([]);

  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  const [clienteActual, setClienteActual] = useState(cliente);

  const [showEdit, setShowEdit] = useState(false);


  const [ultimaLiquidacion, setUltimaLiquidacion] = useState(null);

  const comisionCentimos = Math.round(Number(ultimaLiquidacion?.monto_comision || 0) * 100);
  const mitadDani = Math.ceil(comisionCentimos / 2) / 100;
  const mitadMafer = (comisionCentimos - Math.ceil(comisionCentimos / 2)) / 100;







  useEffect(()=>{

    cargarDatos();

  },[]);







  async function cargarDatos(){


    const articulosData = await getArticles();



    const lista = articulosData.filter(

      articulo => articulo.cliente === clienteActual.id

    ).sort((a, b) => estadoOrden(a.estado) - estadoOrden(b.estado));



    setArticulos(lista);





    const liquidacion = await getLastLiquidacion(

      clienteActual.id

    );


    setUltimaLiquidacion(liquidacion);



  }

  const opcionesEstado = ["Todos", "Disponible", "Vendido", "Liquidado"];
  const contarEstado = estado => articulos.filter(item => estadoNormalizado(item.estado) === estado.toLowerCase()).length;
  const articulosFiltrados = articulos.filter(item => filtroEstado === "Todos" || estadoNormalizado(item.estado) === filtroEstado.toLowerCase());







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

      {ultimaLiquidacion?.monto_comision != null && <InfoCard
        titulo={clienteActual.compartido ? "COMISIÓN PITUCAS · 50/50" : "COMISIÓN PITUCAS"}
        valor={clienteActual.compartido
          ? <span>Dani: S/. {mitadDani.toFixed(2)}<br />Mafer: S/. {mitadMafer.toFixed(2)}</span>
          : `S/. ${Number(ultimaLiquidacion.monto_comision).toFixed(2)}`}
      />}









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
        role="group"
        aria-label="Filtrar artículos por estado"
        style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:5, marginBottom:16 }}
      >
        {opcionesEstado.map(estado => {
          const cantidad = estado === "Todos" ? articulos.length : contarEstado(estado);
          const activo = filtroEstado === estado;
          return <button
            key={estado}
            type="button"
            aria-pressed={activo}
            onClick={() => setFiltroEstado(estado)}
            style={{ flex:"0 0 auto", border:activo ? "1px solid #8B1E2D" : "1px solid #E6D5CC", borderRadius:999, padding:"9px 13px", background:activo ? "#8B1E2D" : "#FFFFFF", color:activo ? "#FFFFFF" : "#594137", fontSize:13, fontWeight:750, cursor:"pointer" }}
          >
            {estado} · {cantidad}
          </button>;
        })}
      </div>

      <div

        style={{

          display:"flex",

          flexDirection:"column",

          gap:"16px",

        }}

      >




      {

        articulosFiltrados.length > 0 ? (


          articulosFiltrados.map(item=>(


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

                <span style={{ display:"inline-flex", marginTop:7, padding:"4px 9px", borderRadius:999, background:estadoFondo(item.estado), color:estadoTexto(item.estado), fontSize:11, fontWeight:800 }}>
                  {estadoEtiqueta(item.estado)}
                </span>


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

            {articulos.length === 0 ? "No tiene artículos registrados" : `No hay artículos con estado “${filtroEstado}”`}


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
