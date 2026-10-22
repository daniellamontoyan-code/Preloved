import { useEffect, useState } from "react";

import DashboardHeader from "../components/DashboardHeader";
import SummaryCard from "../components/SummaryCard";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import BottomNav from "../components/BottomNav";
import AddArticleSheet from "../components/AddArticleSheet";

import Articulos from "./articulos";
import Clientes from "./Clientes";
import Liquidaciones from "./Liquidaciones";

import {
  getArticlesCount,
  getSoldArticlesCount,
  getSalesTotal,
  getPaymentSummary,
} from "../lib/articles";

export default function Dashboard(){

  const [totalArticulos,setTotalArticulos] = useState(0);
  const [vendidos,setVendidos] = useState(0);
  const [ventas,setVentas] = useState(0);
  const [pagos,setPagos] = useState({});

  const [showAddArticle,setShowAddArticle] = useState(false);
  const [showArticulos,setShowArticulos] = useState(false);
  const [showClientes,setShowClientes] = useState(false);
  const [showLiquidaciones,setShowLiquidaciones] = useState(false);

  const [categoriaSeleccionada,setCategoriaSeleccionada] = useState("");



  async function cargarDatos(){

    const total = await getArticlesCount();
    const vendidosData = await getSoldArticlesCount();
    const ventasData = await getSalesTotal();
    const pagosData = await getPaymentSummary();

    setTotalArticulos(total);
    setVendidos(vendidosData);
    setVentas(ventasData);
    setPagos(pagosData);

  }



  useEffect(()=>{

    cargarDatos();

    window.addEventListener(
      "focus",
      cargarDatos
    );


    return ()=>{

      window.removeEventListener(
        "focus",
        cargarDatos
      );

    };

  },[]);





  if(showArticulos){

    return (

      <Articulos

        categoria={categoriaSeleccionada}

        onBack={()=>{

          setShowArticulos(false);
          cargarDatos();

        }}

        onHome={()=>{

          setShowArticulos(false);
          setShowClientes(false);
          setShowLiquidaciones(false);

        }}

        onClientes={()=>{

          setShowArticulos(false);
          setShowClientes(true);

        }}

        onLiquidaciones={()=>{

          setShowArticulos(false);
          setShowLiquidaciones(true);

        }}

        onAgregar={()=>{

          setShowAddArticle(true);

        }}

      />

    );

  }





  if(showClientes){

    return (

      <Clientes

        onBack={()=>{

          setShowClientes(false);
          cargarDatos();

        }}

        onHome={()=>{

          setShowClientes(false);

        }}

        onArticulos={()=>{

          setShowClientes(false);
          setShowArticulos(true);

        }}

        onLiquidaciones={()=>{

          setShowClientes(false);
          setShowLiquidaciones(true);

        }}

      />

    );

  }





  if(showLiquidaciones){

    return (

      <Liquidaciones

        onBack={()=>{

          setShowLiquidaciones(false);

        }}

        onHome={()=>{

          setShowLiquidaciones(false);

        }}

        onArticulos={()=>{

          setShowLiquidaciones(false);
          setShowArticulos(true);

        }}

        onClientes={()=>{

          setShowLiquidaciones(false);
          setShowClientes(true);

        }}

        onAgregar={()=>{

          setShowAddArticle(true);

        }}

      />

    );

  }





  const categorias=[

    {
      nombre:"Ropa",
      color:"linear-gradient(135deg,#9D001E,#C0003B)"
    },

    {
      nombre:"Calzado",
      color:"linear-gradient(135deg,#60A5FA,#38BDF8)"
    },

    {
      nombre:"Bolsos",
      color:"linear-gradient(135deg,#F9A8D4,#EC4899)"
    },

    {
      nombre:"Accesorios",
      color:"linear-gradient(135deg,#FDBA74,#F97316)"
    },

    {
      nombre:"Otros",
      color:"linear-gradient(135deg,#86EFAC,#22C55E)"
    }

  ];





  return (

    <div

      style={{

        minHeight:"100vh",

        background:"#FAFAFC",

        padding:"100px 20px 120px",

        maxWidth:"430px",

        margin:"0 auto",

        position:"relative",

        overflow:"hidden"

      }}

    >


      <div

        style={{

          position:"absolute",

          width:"230px",

          height:"230px",

          borderRadius:"50%",

          background:"#C4B5FD",

          filter:"blur(80px)",

          opacity:.35,

          top:"40px",

          left:"-90px"

        }}

      />


      <div

        style={{

          position:"absolute",

          width:"230px",

          height:"230px",

          borderRadius:"50%",

          background:"#FBCFE8",

          filter:"blur(80px)",

          opacity:.35,

          top:"160px",

          right:"-100px"

        }}

      />


      <div

        style={{

          position:"absolute",

          width:"200px",

          height:"200px",

          borderRadius:"50%",

          background:"#BBF7D0",

          filter:"blur(80px)",

          opacity:.35,

          bottom:"80px",

          left:"-80px"

        }}

      />





      <div

        style={{

          position:"absolute",

          top:"25px",

          left:"50%",

          transform:"translateX(-50%)",

          width:"100%",

          display:"flex",

          justifyContent:"center"

        }}

      >

        <h1

          style={{

            margin:0,

            fontSize:"36px",

            fontWeight:"900",

            background:"linear-gradient(90deg,#9D001E,#C0003B,#F43F5E)",

            WebkitBackgroundClip:"text",

            WebkitTextFillColor:"transparent"

          }}

        >

          Cherry

        </h1>

      </div>





      <div

        style={{

          position:"relative",

          zIndex:2

        }}

      >


        <DashboardHeader

          nombre={localStorage.getItem("usuario") || "Dani"}

        />



        <div

          style={{

            display:"grid",

            gridTemplateColumns:"1fr 1fr",

            gap:"16px",

            marginTop:"35px"

          }}

        >

          <SummaryCard

            value={totalArticulos}

            title="Artículos"

          />

          <SummaryCard

            value={vendidos}

            title="Vendidos"

          />

        </div>




        <div style={{marginTop:"16px"}}>

          <SummaryCard

            value={`S/. ${ventas.toFixed(2)}`}

            title="Ventas"

          />

        </div>





        <div style={{marginTop:"30px"}}>

          <PrimaryButton

            text="Agregar artículo"

            onClick={()=>setShowAddArticle(true)}

          />

        </div>





        <div style={{marginTop:"35px"}}>

          <SectionTitle

            title="Métodos de pago"

          />

          <div

            style={{

              background:"#FFFFFF",

              borderRadius:"18px",

              padding:"12px 18px",

              marginTop:"12px",

              boxShadow:"0 8px 20px rgba(0,0,0,.04)"

            }}

          >

            {
              Object.entries(pagos).map(([metodo,monto],index)=>(

                <div

                  key={metodo}

                  style={{

                    display:"flex",

                    justifyContent:"space-between",

                    padding:"10px 0",

                    borderBottom:

                    index !== Object.entries(pagos).length-1

                    ? "1px solid #F3F4F6"

                    : "none",

                    fontWeight:"700"

                  }}

                >

                  <span>{metodo}</span>

                  <span style={{color:"#C0003B"}}>

                    S/. {monto.toFixed(2)}

                  </span>


                </div>

              ))
            }

          </div>

        </div>





        <div style={{marginTop:"40px"}}>

          <SectionTitle

            title="Categorías"

            action="Ver todo"

            onClick={()=>{

              setCategoriaSeleccionada("");

              setShowArticulos(true);

            }}

          />



          <div

            style={{

              display:"flex",

              flexDirection:"column",

              gap:"14px",

              marginTop:"18px"

            }}

          >

            {
              categorias.map(cat=>(

                <button

                  key={cat.nombre}

                  onClick={()=>{

                    setCategoriaSeleccionada(cat.nombre);

                    setShowArticulos(true);

                  }}

                  style={{

                    width:"100%",

                    height:"64px",

                    border:"none",

                    borderRadius:"22px",

                    background:"#FFFFFF",

                    padding:"0 20px",

                    display:"flex",

                    justifyContent:"space-between",

                    alignItems:"center",

                    boxShadow:"0 10px 30px rgba(0,0,0,.05)"

                  }}

                >

                  <span

                    style={{

                      fontSize:"17px",

                      fontWeight:"700"

                    }}

                  >

                    {cat.nombre}

                  </span>


                  <span

                    style={{

                      width:"36px",

                      height:"36px",

                      borderRadius:"50%",

                      background:cat.color,

                      color:"#FFFFFF",

                      display:"flex",

                      justifyContent:"center",

                      alignItems:"center",

                      fontSize:"22px",

                      fontWeight:"800"

                    }}

                  >

                    →

                  </span>


                </button>

              ))
            }

          </div>

        </div>


      </div>






      {!showAddArticle && (

        <BottomNav

          onHome={()=>{}}

          onArticulos={()=>setShowArticulos(true)}

          onAgregar={()=>setShowAddArticle(true)}

          onClientes={()=>setShowClientes(true)}

          onLiquidaciones={()=>setShowLiquidaciones(true)}

        />

      )}





      {
        showAddArticle && (

          <AddArticleSheet

            onClose={()=>{

              setShowAddArticle(false);

              cargarDatos();

            }}

          />

        )
      }


    </div>

  );

}