import { useEffect, useState } from "react";
import { Plus, ChevronRight, ChevronLeft, Shirt } from "lucide-react";

import BottomNav from "../components/BottomNav";
import AddArticleSheet from "../components/AddArticleSheet";
import NewClientSheet from "../components/NewClientSheet";

import DetalleCliente from "./DetalleCliente";

import { getClients } from "../lib/clients";
import { getArticles } from "../lib/articles";
import { getClientColor } from "../lib/clientColors";



export default function Clientes({

  onBack,
  onHome,
  onArticulos,
  onLiquidaciones,
  onGastos,
  onEstadisticas,

}) {


  const [clientes, setClientes] = useState([]);

  const [filtroArticulos, setFiltroArticulos] = useState("Todos");

  const [showAddArticle, setShowAddArticle] = useState(false);

  const [showAddClient, setShowAddClient] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);






  useEffect(()=>{

    cargarClientes();

  },[]);








  async function cargarClientes(){


    const clientesData = await getClients();

    const articulosData = await getArticles();



    const clientesConCantidad = clientesData.map(cliente=>{
      const articulosCliente = articulosData.filter(articulo => articulo.cliente === cliente.id);
      const contar = estado => articulosCliente.filter(articulo => String(articulo.estado || "").trim().toLowerCase() === estado).length;



      return {

        ...cliente,

        cantidad:articulosCliente.length,
        cantidadDisponible:contar("disponible"),
        cantidadVendida:contar("vendido"),
        cantidadLiquidada:contar("liquidado"),

      };


    });



    setClientes(clientesConCantidad);


  }









  const filtrosArticulos = [
    { id:"Todos", label:"Todos", count:clientes.reduce((sum, cliente) => sum + cliente.cantidad, 0) },
    { id:"Disponible", label:"Disponibles", count:clientes.reduce((sum, cliente) => sum + cliente.cantidadDisponible, 0) },
    { id:"Vendido", label:"Vendidos", count:clientes.reduce((sum, cliente) => sum + cliente.cantidadVendida, 0) },
    { id:"Liquidado", label:"Liquidados", count:clientes.reduce((sum, cliente) => sum + cliente.cantidadLiquidada, 0) },
  ];
  const clientesFiltrados = filtroArticulos === "Todos" ? clientes : clientes.filter(cliente => {
    const key = { Disponible:"cantidadDisponible", Vendido:"cantidadVendida", Liquidado:"cantidadLiquidada" }[filtroArticulos];
    return cliente[key] > 0;
  });

  if(clienteSeleccionado){


    return (

      <DetalleCliente

        cliente={clienteSeleccionado}

        onBack={()=>{

          setClienteSeleccionado(null);

          cargarClientes();

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

            fontSize:"28px",

            fontWeight:"750",

            color:"#383B3B",

            flex:1,

          }}

        >

          Clientes

        </h1>






        {/* CREAR CLIENTE */}

        <button

          onClick={()=>{

            setShowAddClient(true);

          }}

          style={{

            width:"42px",

            height:"42px",

            borderRadius:"50%",

            border:"none",

            background:"#8B1E2D",

            color:"#FFFFFF",

            display:"flex",

            alignItems:"center",

            justifyContent:"center",

            boxShadow:"0 8px 20px rgba(124,92,252,.3)",

          }}

        >

          <Plus size={24}/>

        </button>



      </div>









      <div role="group" aria-label="Filtrar clientes por estado de sus prendas" style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:5, marginBottom:16 }}>
        {filtrosArticulos.map(filtro => {
          const activo = filtroArticulos === filtro.id;
          return <button
            key={filtro.id}
            type="button"
            aria-pressed={activo}
            onClick={() => setFiltroArticulos(filtro.id)}
            style={{ flex:"0 0 auto", border:activo ? "1px solid #8B1E2D" : "1px solid #E6D5CC", borderRadius:999, padding:"9px 13px", background:activo ? "#8B1E2D" : "#FFFFFF", color:activo ? "#FFFFFF" : "#594137", fontSize:13, fontWeight:750, cursor:"pointer" }}
          >
            {filtro.label} · {filtro.count}
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

        clientesFiltrados.length > 0 ? (


          clientesFiltrados.map(cliente=>{


            const color = getClientColor(cliente.color);



            return (

            <button

              key={cliente.id}

              onClick={()=>{

                setClienteSeleccionado(cliente);

              }}

              style={{

                width:"100%",

                background:"#FFFFFF",

                border:"none",

                borderRadius:"24px",

                padding:"20px",

                display:"flex",

                justifyContent:"space-between",

                alignItems:"center",

                boxShadow:"0 12px 35px rgba(0,0,0,.06)",

                cursor:"pointer",

                textAlign:"left",

              }}

            >



              <div>


                <h3

                  style={{

                    margin:"0 0 12px",

                    fontSize:"20px",

                    fontWeight:"750",

                    color:color.texto,

                  }}

                >

                  {cliente.nombre}
                  <span aria-hidden="true" style={{ display:"inline-block", width:11, height:11, marginLeft:8, verticalAlign:"middle", borderRadius:"50%", background:color.valor, boxShadow:"0 0 0 2px #FFFFFF, 0 0 0 3px rgba(89,65,55,.18)" }}/>
                  {cliente.compartido && <span style={{ display:"inline-block", verticalAlign:"middle", marginLeft:8, padding:"4px 8px", borderRadius:999, background:"#FFC9E3", color:"#8B1E2D", fontSize:10, fontWeight:800 }}>AMBAS</span>}

                </h3>





                <div

                  style={{

                    display:"flex",

                    alignItems:"center",

                    gap:"10px",

                  }}

                >


                  <span

                    style={{

                      display:"flex",

                      alignItems:"center",

                      gap:"5px",

                      background:color?.fondo || "#FFC9E3",

                      padding:"6px 10px",

                      borderRadius:"20px",

                      fontSize:"13px",

                      fontWeight:"600",

                      color:"#7B7B88",

                    }}

                  >

                    <Shirt size={14}/>

                    {cliente.cantidad}

                  </span>





                  <span

                    style={{

                      background:color.fondo,

                      color:color.texto,

                      padding:"6px 12px",

                      borderRadius:"20px",

                      fontSize:"13px",

                      fontWeight:"700",

                    }}

                  >

                    {cliente.porcentaje_comision}%

                  </span>



                </div>

                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
                  {[
                    { label:"Disponibles", cantidad:cliente.cantidadDisponible, color:"#28733B", fondo:"#E8F7ED" },
                    { label:"Vendidos", cantidad:cliente.cantidadVendida, color:"#A52A2A", fondo:"#FDE9E8" },
                    { label:"Liquidados", cantidad:cliente.cantidadLiquidada, color:"#805B00", fondo:"#FFF3CD" },
                  ].map(resumen => <span key={resumen.label} style={{ background:resumen.fondo, color:resumen.color, padding:"5px 9px", borderRadius:999, fontSize:11, fontWeight:750 }}>
                    {resumen.label} {resumen.cantidad}
                  </span>)}
                </div>

              </div>






              <ChevronRight

                size={24}

                color={color.texto}

              />




            </button>


            )

          })



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

            {clientes.length === 0 ? "No tienes clientes registrados" : `No hay clientes con prendas “${filtroArticulos.toLowerCase()}”`}


          </div>


        )


      }



      </div>









      {
        !showAddClient && !showAddArticle && (

          <BottomNav


            onHome={onHome || onBack}



            onArticulos={()=>{

              if(onArticulos){

                onArticulos();

              }

            }}



            onAgregar={()=>{

              setShowAddArticle(true);

            }}



            onClientes={()=>{}}



            onLiquidaciones={onLiquidaciones}
            onGastos={onGastos}
            onEstadisticas={onEstadisticas}


          />

        )
      }









      {
        showAddArticle && (

          <AddArticleSheet

            onClose={()=>{

              setShowAddArticle(false);

              cargarClientes();

            }}

          />

        )
      }








      {
        showAddClient && (

          <NewClientSheet

            onClose={()=>{

              setShowAddClient(false);

            }}


            onCreated={()=>{

              setShowAddClient(false);

              cargarClientes();

            }}

          />

        )
      }



    </div>

  );

}
