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

import {
  getArticlesCount,
  getSoldArticlesCount,
  getSalesTotal,
  getPaymentSummary,
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

  const [totalArticulos,setTotalArticulos] = useState(0);
  const [vendidos,setVendidos] = useState(0);
  const [ventas,setVentas] = useState(0);
  const [pagos,setPagos] = useState({});
  const [articulos,setArticulos] = useState([]);

  const [showAddArticle,setShowAddArticle] = useState(false);
  const [showArticulos,setShowArticulos] = useState(false);
  const [showClientes,setShowClientes] = useState(false);
  const [showLiquidaciones,setShowLiquidaciones] = useState(false);
  const [showGastos,setShowGastos] = useState(false);

  const [categoriaSeleccionada,setCategoriaSeleccionada] = useState("");
  const [canalSeleccionado,setCanalSeleccionado] = useState("Todos");
  const [subcategoriaSeleccionada,setSubcategoriaSeleccionada] = useState("");



  async function cargarDatos(){

    const total = await getArticlesCount();
    const vendidosData = await getSoldArticlesCount();
    const ventasData = await getSalesTotal();
    const pagosData = await getPaymentSummary();
    const articulosData = await getArticles();

    setTotalArticulos(total);
    setVendidos(vendidosData);
    setVentas(ventasData);
    setPagos(pagosData);
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

        onGastos={()=>{
          setShowLiquidaciones(false);
          setShowGastos(true);
        }}

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
    />;
  }





  const categorias=[

    {
      nombre:"Ropa",
      color:"linear-gradient(135deg,#8B1E2D,#8B1E2D)"
    },

    {
      nombre:"Calzado",
      color:"linear-gradient(135deg,#8B1E2D,#FF6B9E)"
    },

    {
      nombre:"Bolsos",
      color:"linear-gradient(135deg,#FF6B9E,#FF6B9E)"
    },

    {
      nombre:"Accesorios",
      color:"linear-gradient(135deg,#8B1E2D,#E11D48)"
    },

    {
      nombre:"Otros",
      color:"linear-gradient(135deg,#B42348,#FF6B9E)"
    }

  ];

  const tiposArticulo = [...new Map(articulos
    .filter(item => item.subcategoria)
    .map(item => [`${item.categoria || ""}:${item.subcategoria}`, { categoria: item.categoria || "", subcategoria: item.subcategoria }]))
    .values()]
    .sort((a, b) => a.subcategoria.localeCompare(b.subcategoria, "es"));

  function abrirArticulos({ canal = "Todos", categoria = "", subcategoria = "" } = {}) {
    setCanalSeleccionado(canal);
    setCategoriaSeleccionada(categoria);
    setSubcategoriaSeleccionada(subcategoria);
    setShowArticulos(true);
  }





  return (

    <div

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

                  <span style={{color:"#8B1E2D"}}>

                    S/. {monto.toFixed(2)}

                  </span>


                </div>

              ))
            }

          </div>

        </div>





        <div style={{marginTop:"34px"}}>
          <SectionTitle title="Explorar artículos" />
          <p style={{ margin:"8px 0 12px", color:"#777783", fontSize:13, fontWeight:600 }}>Filtra por dónde los ofreces</p>
          <div style={{ display:"flex", gap:9, overflowX:"auto", paddingBottom:4 }}>
            {["Todos", "Feria", "Web"].map(canal => (
              <button key={canal} onClick={() => abrirArticulos({ canal })} style={{ flex:"0 0 auto", border:0, borderRadius:999, padding:"11px 17px", background:canalSeleccionado === canal ? "#8B1E2D" : "#FFFFFF", color:canalSeleccionado === canal ? "#FFFFFF" : "#555563", fontWeight:800, boxShadow:"0 5px 16px rgba(0,0,0,.05)" }}>
                {canal === "Web" ? "Página web" : canal}
              </button>
            ))}
          </div>
          {tiposArticulo.length > 0 && <>
            <p style={{ margin:"18px 0 10px", color:"#777783", fontSize:13, fontWeight:600 }}>Tipos de prenda, accesorio o calzado</p>
            <div style={{ display:"flex", gap:9, overflowX:"auto", paddingBottom:4 }}>
              {tiposArticulo.map(tipo => (
                <button key={`${tipo.categoria}:${tipo.subcategoria}`} onClick={() => abrirArticulos({ canal:canalSeleccionado, categoria:tipo.categoria, subcategoria:tipo.subcategoria })} style={{ flex:"0 0 auto", border:"1px solid #EAD5DA", borderRadius:15, padding:"11px 14px", background:"#FFFFFF", color:"#77152B", fontWeight:700, boxShadow:"0 5px 16px rgba(0,0,0,.04)" }}>
                  {tipo.subcategoria}{tipo.categoria ? <span style={{ color:"#999", fontSize:11, marginLeft:5 }}>{tipo.categoria}</span> : null}
                </button>
              ))}
            </div>
          </>}
        </div>

        <div style={{marginTop:"32px"}}>

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
          onGastos={()=>setShowGastos(true)}

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
