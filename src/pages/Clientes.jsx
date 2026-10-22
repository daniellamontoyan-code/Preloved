import { useEffect, useState } from "react";
import { Plus, ChevronRight, ChevronLeft, Shirt } from "lucide-react";

import BottomNav from "../components/BottomNav";
import AddArticleSheet from "../components/AddArticleSheet";
import NewClientSheet from "../components/NewClientSheet";

import DetalleCliente from "./DetalleCliente";

import { getClients } from "../lib/clients";
import { getArticles } from "../lib/articles";



export default function Clientes({

  onBack,
  onHome,
  onArticulos,
  onLiquidaciones,

}) {


  const [clientes, setClientes] = useState([]);

  const [showAddArticle, setShowAddArticle] = useState(false);

  const [showAddClient, setShowAddClient] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);






  const colores = [

    {
      fondo:"#FCE7F3",
      texto:"#DB2777"
    },

    {
      fondo:"#E0F2FE",
      texto:"#0284C7"
    },

    {
      fondo:"#EDE9FE",
      texto:"#7C3AED"
    },

    {
      fondo:"#DCFCE7",
      texto:"#16A34A"
    },

    {
      fondo:"#FFEDD5",
      texto:"#EA580C"
    }

  ];







  useEffect(()=>{

    cargarClientes();

  },[]);








  async function cargarClientes(){


    const clientesData = await getClients();

    const articulosData = await getArticles();



    const clientesConCantidad = clientesData.map(cliente=>{


      const cantidad = articulosData.filter(

        articulo => articulo.cliente === cliente.id

      ).length;



      return {

        ...cliente,

        cantidad,

      };


    });



    setClientes(clientesConCantidad);


  }








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

        background:"#FAFAFC",

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

            background:"#F3F3F7",

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

            color:"#1F1F28",

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

            background:"#C0003B",

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









      <div

        style={{

          display:"flex",

          flexDirection:"column",

          gap:"16px",

        }}

      >



      {

        clientes.length > 0 ? (


          clientes.map((cliente,index)=>{


            const color = colores[index % colores.length];



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

                      background:"#FFF0F3",

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

            No tienes clientes registrados


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