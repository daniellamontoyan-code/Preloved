import { useEffect, useState } from "react";

import DashboardHeader from "../components/DashboardHeader";
import SummaryCard from "../components/SummaryCard";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import BottomNav from "../components/BottomNav";
import AddArticleSheet from "../components/AddArticleSheet";
import BrandLockup from "../components/BrandLockup";

import Articulos from "./articulos";
import Clientes from "./Clientes";
import Liquidaciones from "./Liquidaciones";
import Gastos from "./Gastos";
import Estadisticas from "./Estadisticas";

import {
  getSalesTotal,
  getArticles,
} from "../lib/articles";
import { supabase } from "../lib/supabase";
import { getCurrentAppUser } from "../lib/usuarios";
import { clearPrivatePhotoCache } from "../lib/storage";

export default function Dashboard({ user }){

  const [nombreUsuario, setNombreUsuario] = useState(user?.user_metadata?.nombre || user?.email?.split("@")[0] || "Pitucas Pero Misias");

  async function cerrarSesion(){
    if (user?.id) localStorage.removeItem(`cherry_catalog_cache_${user.id}`);
    await clearPrivatePhotoCache();
    await supabase.auth.signOut();
  }

  const [ventas,setVentas] = useState(0);
  const [articulos,setArticulos] = useState([]);

  const [showAddArticle,setShowAddArticle] = useState(false);
  const [showArticulos,setShowArticulos] = useState(false);
  const [showClientes,setShowClientes] = useState(false);
  const [showLiquidaciones,setShowLiquidaciones] = useState(false);
  const [showGastos,setShowGastos] = useState(false);
  const [showEstadisticas,setShowEstadisticas] = useState(false);

  const [categoriaSeleccionada,setCategoriaSeleccionada] = useState("");
  const [canalSeleccionado,setCanalSeleccionado] = useState("Todos");
  const [subcategoriaSeleccionada,setSubcategoriaSeleccionada] = useState("");



  async function cargarDatos(){
    const [ventasData, articulosData] = await Promise.all([getSalesTotal(), getArticles()]);
    setVentas(ventasData);
    setArticulos(articulosData || []);

  }



  useEffect(()=>{

    getCurrentAppUser().then(appUser => {
      if (appUser?.nombre) setNombreUsuario(appUser.nombre);
    });

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

    const paymentQrSrc = user?.email?.toLowerCase() === "daniellamontoyan@gmail.com"
      ? "/yape-daniela.jpeg"
      : null;

    return (

      <Articulos

        categoria={categoriaSeleccionada}
        canalInicial={canalSeleccionado}
        subcategoriaInicial={subcategoriaSeleccionada}
        ownerId={user?.id}
        paymentQrSrc={paymentQrSrc}

        onBack={()=>{

          setShowArticulos(false);
          setCategoriaSeleccionada("");
          setCanalSeleccionado("Todos");
          setSubcategoriaSeleccionada("");
          cargarDatos();

        }}

        onHome={()=>{

          setShowArticulos(false);
          setShowClientes(false);
          setShowLiquidaciones(false);
          setCategoriaSeleccionada("");
          setCanalSeleccionado("Todos");
          setSubcategoriaSeleccionada("");

        }}

        onClientes={()=>{

          setShowArticulos(false);
          setShowClientes(true);

        }}

        onGastos={()=>{
          setShowArticulos(false);
          setShowGastos(true);
        }}

        onLiquidaciones={()=>{

          setShowArticulos(false);
          setShowLiquidaciones(true);

        }}

        onEstadisticas={()=>{ setShowArticulos(false); setShowEstadisticas(true); }}

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

        onGastos={()=>{
          setShowClientes(false);
          setShowGastos(true);
        }}

        onEstadisticas={()=>{ setShowClientes(false); setShowEstadisticas(true); }}

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
          setShowLiquidaciones(false);
          setShowAddArticle(true);

        }}

        onGastos={()=>{
          setShowLiquidaciones(false);
          setShowGastos(true);
        }}

        onEstadisticas={()=>{ setShowLiquidaciones(false); setShowEstadisticas(true); }}

      />

    );

  }

  if(showGastos){
    return <Gastos
      onBack={()=>setShowGastos(false)}
      onHome={()=>{
        setShowGastos(false);
        setShowArticulos(false);
        setShowClientes(false);
        setShowLiquidaciones(false);
        cargarDatos();
      }}
      onArticulos={()=>{ setShowGastos(false); setShowArticulos(true); }}
      onClientes={()=>{ setShowGastos(false); setShowClientes(true); }}
      onLiquidaciones={()=>{ setShowGastos(false); setShowLiquidaciones(true); }}
      onGastos={()=>{}}
      onEstadisticas={()=>{ setShowGastos(false); setShowEstadisticas(true); }}
    />;
  }

  if(showEstadisticas){
    return <Estadisticas
      articulos={articulos}
      nombreUsuario={nombreUsuario}
      onRefresh={cargarDatos}
      onBack={()=>setShowEstadisticas(false)}
      onHome={()=>setShowEstadisticas(false)}
      onArticulos={()=>{ setShowEstadisticas(false); setShowArticulos(true); }}
      onClientes={()=>{ setShowEstadisticas(false); setShowClientes(true); }}
      onLiquidaciones={()=>{ setShowEstadisticas(false); setShowLiquidaciones(true); }}
      onGastos={()=>{ setShowEstadisticas(false); setShowGastos(true); }}
      onAgregar={()=>{ setShowEstadisticas(false); setShowAddArticle(true); }}
      onEstadisticas={()=>{}}
    />;
  }





  return (

    <div
      className="app-page app-page-dashboard"
      style={{

        minHeight:"100vh",

        background:"#F5EBDD",

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

          background:"#FF6B9E",

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

          background:"#FFC9E3",

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

          background:"#FFC9E3",

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

            fontSize:"24px",

            fontWeight:"900",

            background:"linear-gradient(90deg,#8B1E2D,#8B1E2D,#FF6B9E)",

            WebkitBackgroundClip:"text",

            WebkitTextFillColor:"transparent"

          }}

        >

          <BrandLockup compact />

        </h1>

      </div>





      <div

        style={{

          position:"relative",

          zIndex:2

        }}

      >


        <DashboardHeader
          nombre={nombreUsuario}
          onLogout={cerrarSesion}

        />



        <div style={{marginTop:"35px"}}>
          <SummaryCard value={`S/. ${ventas.toFixed(2)}`} title="Ventas" />
        </div>


        <div style={{marginTop:"30px"}}>

          <PrimaryButton

            text="Agregar artículo"

            onClick={()=>setShowAddArticle(true)}

          />

        </div>





        <div style={{marginTop:"34px"}}>
          <SectionTitle
            title="Artículos"
            action="Ver todos"
            onClick={()=>{
              setCategoriaSeleccionada("");
              setCanalSeleccionado("Todos");
              setSubcategoriaSeleccionada("");
              setShowArticulos(true);
            }}
          />
        </div>

      </div>






      {!showAddArticle && (

        <BottomNav

          onHome={()=>{}}

          onArticulos={()=>setShowArticulos(true)}

          onAgregar={()=>setShowAddArticle(true)}

          onClientes={()=>setShowClientes(true)}

          onLiquidaciones={()=>setShowLiquidaciones(true)}
          onGastos={()=>setShowGastos(true)}
          onEstadisticas={()=>setShowEstadisticas(true)}

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
