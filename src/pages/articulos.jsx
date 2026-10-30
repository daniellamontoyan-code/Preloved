import { useEffect, useState } from "react";
import { ChevronLeft, Wifi, WifiOff } from "lucide-react";

import ProductCard from "../components/ProductCard";
import DetalleArticulo from "./DetalleArticulo";
import BottomNav from "../components/BottomNav";
import AddArticleSheet from "../components/AddArticleSheet";
import SaleSheet from "../components/SaleSheet";

import { getArticles, getPendingSales, syncPendingSales } from "../lib/articles";



export default function Articulos({ 

  categoria,
  canalInicial = "Todos",
  subcategoriaInicial = "",
  ownerId,
  paymentQrSrc,
  onBack,
  onHome,
  onArticulos,
  onClientes,
  onLiquidaciones,
  onGastos,

}) {


  const [articulos, setArticulos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [canalSeleccionado, setCanalSeleccionado] = useState(canalInicial);
  const [categoriaFiltro, setCategoriaFiltro] = useState(categoria || "Todos");
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState(subcategoriaInicial);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showSale, setShowSale] = useState(null);
  const [modoFeria, setModoFeria] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState(getPendingSales(ownerId).length);







  useEffect(()=>{

    cargarArticulos();
  },[categoria]);

  useEffect(() => {
    const updateNetwork = async () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) {
        const result = await syncPendingSales();
        if (result.conflicts > 0) alert(`${result.conflicts} venta(s) quedó(aron) sin confirmar porque la prenda ya no estaba disponible. Revisa esa venta con la persona antes de cerrar el cobro.`);
        setPendientes(getPendingSales(ownerId).length);
        cargarArticulos();
      }
    };
    const updatePending = () => setPendientes(getPendingSales(ownerId).length);
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    window.addEventListener("cherry-pending-sales", updatePending);
    if (navigator.onLine && getPendingSales(ownerId).length > 0) updateNetwork();
    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
      window.removeEventListener("cherry-pending-sales", updatePending);
    };
  }, [ownerId]);





  async function cargarArticulos(){


    const data = await getArticles();



    let lista = data;



    if(categoria){

      lista = lista.filter(

        item => item.categoria === categoria

      );

    }




      const prioridadEstado = (estado) => {
      const valor = (estado || "").trim().toLowerCase();
      if (valor === "disponible") return 0;
      if (valor === "vendido") return 1;
      if (valor === "liquidado") return 2;
      return 3;
    };

    lista.sort((a, b) => {
      const diferenciaEstado =
        prioridadEstado(a.estado) - prioridadEstado(b.estado);

      if (diferenciaEstado !== 0) return diferenciaEstado;

      return (a.descripcion || "").localeCompare(b.descripcion || "");
    });



    setArticulos(lista);


  }







  const textoBusqueda = busqueda.trim().toLowerCase();
  const categoriasDisponibles = [...new Set(articulos.map(item => item.categoria).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));
  let filtrados = articulos.filter(item => {
    const coincideBusqueda = !textoBusqueda || [item.descripcion, item.codigo, item.categoria, item.subcategoria, item.talla]
      .some(valor => String(valor || "").toLowerCase().includes(textoBusqueda));
    const coincideCategoria = categoriaFiltro === "Todos" || item.categoria === categoriaFiltro;
    const coincideSubcategoria = !subcategoriaFiltro || item.subcategoria === subcategoriaFiltro;
    const estado = String(item.estado || "").trim().toLowerCase();
    const coincideEstado = estadoFiltro === "Todos"
      || (estadoFiltro === "Disponible" && estado === "disponible")
      || (estadoFiltro === "Vendido" && estado === "vendido")
      || (estadoFiltro === "Liquidado" && estado === "liquidado");
    const coincideCanal = canalSeleccionado === "Todos"
      || (canalSeleccionado === "Feria" ? item.publicar_feria !== false : item.publicar_web !== false);
    return coincideBusqueda && coincideCategoria && coincideSubcategoria && coincideEstado && coincideCanal;
  });

  if (modoFeria) filtrados = filtrados.filter(item => item.estado === "Disponible" && item.publicar_feria !== false);

  const subcategoriasDisponibles = [...new Set(articulos
    .filter(item => categoriaFiltro === "Todos" || item.categoria === categoriaFiltro)
    .map(item => item.subcategoria)
    .filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));

  filtrados.sort((a, b) => {
    const prioridad = estado => {
      const valor = String(estado || "").trim().toLowerCase();
      if (valor === "disponible") return 0;
      if (valor === "vendido") return 1;
      if (valor === "liquidado") return 2;
      return 3;
    };
    return prioridad(a.estado) - prioridad(b.estado)
      || (a.descripcion || "").localeCompare(b.descripcion || "");
  });

  if(articuloSeleccionado){


    return (

      <DetalleArticulo

        articulo={articuloSeleccionado}
        modoFeria={modoFeria}

        onUpdated={(updated)=>{
          setArticuloSeleccionado(updated);
          setArticulos(current => current.map(item => String(item.id) === String(updated.id) ? { ...item, ...updated } : item));
        }}

        onBack={()=>{

          setArticuloSeleccionado(null);

          cargarArticulos();

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

          gap:"12px",

          marginBottom:"24px",

        }}

      >



        <button

          onClick={onBack}

          style={{

            border:"none",

            background:"#F5EBDD",

            width:"40px",

            height:"40px",

            borderRadius:"50%",

            display:"flex",

            alignItems:"center",

            justifyContent:"center",

          }}

        >

          <ChevronLeft size={22}/>

        </button>







        <h1

          style={{

            margin:0,

            fontSize:"26px",

            fontWeight:"700",

            color:"#383B3B",

          }}

        >

          {categoriaFiltro === "Todos" ? "Artículos" : categoriaFiltro}

        </h1>



      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, color: online ? "#177245" : "#A45B00", fontSize:13, fontWeight:700 }}>
          {online ? <Wifi size={17}/> : <WifiOff size={17}/>}
          {online ? "Con internet" : "Sin internet · catálogo guardado"}
        </div>
        {pendientes > 0 && <span style={{ fontSize:12, color:"#A45B00", fontWeight:700 }}>{pendientes} venta{pendientes === 1 ? "" : "s"} por sincronizar</span>}
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#7B7B88", marginBottom:8 }}>Ver artículos de</div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:2 }}>
          {["Todos", "Feria", "Web"].map(canal => (
            <button key={canal} onClick={() => { setCanalSeleccionado(canal); if (canal !== "Feria") setModoFeria(false); }} style={{ flex:"0 0 auto", border:0, borderRadius:999, padding:"10px 16px", background:canalSeleccionado === canal ? "#8B1E2D" : "#FFFFFF", color:canalSeleccionado === canal ? "#FFFFFF" : "#555563", fontWeight:800 }}>
              {canal === "Web" ? "Página web" : canal}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => setModoFeria(value => { const next = !value; if (next) setCanalSeleccionado("Feria"); return next; })} style={{ width:"100%", height:46, marginBottom:16, border:0, borderRadius:15, background: modoFeria ? "#8B1E2D" : "#FFC9E3", color: modoFeria ? "white" : "#8B1E2D", fontSize:14, fontWeight:800 }}>
        {modoFeria ? "✓ Modo venta feria activo" : "Activar modo venta feria"}
      </button>









      <input

        placeholder="Buscar artículo"

        value={busqueda}

        onChange={(e)=>setBusqueda(e.target.value)}

        style={{

          width:"100%",

          height:"54px",

          borderRadius:"18px",

          border:"1px solid #E5E7EB",

          padding:"0 18px",

          fontSize:"16px",

          marginBottom:"16px",

          background:"#FFFFFF",

          outline:"none",

        }}

      />








      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#7B7B88", marginBottom:8 }}>Categoría</div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:2 }}>
          {["Todos", ...categoriasDisponibles].map(nombre => (
            <button key={nombre} onClick={() => { setCategoriaFiltro(nombre); setSubcategoriaFiltro(""); }} style={{ flex:"0 0 auto", border:0, borderRadius:999, padding:"10px 14px", background:categoriaFiltro === nombre ? "#8B1E2D" : "#FFFFFF", color:categoriaFiltro === nombre ? "#FFFFFF" : "#555563", fontWeight:700, fontSize:13 }}>
              {nombre === "Todos" ? "Todas" : nombre}
            </button>
          ))}
        </div>
      </div>

      {subcategoriasDisponibles.length > 0 && <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#7B7B88", marginBottom:8 }}>Tipo de artículo</div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:2 }}>
          {["", ...subcategoriasDisponibles].map(tipo => (
            <button key={tipo || "todas-subcategorias"} onClick={() => setSubcategoriaFiltro(tipo)} style={{ flex:"0 0 auto", border:0, borderRadius:999, padding:"10px 14px", background:subcategoriaFiltro === tipo ? "#FFC9E3" : "#FFFFFF", color:subcategoriaFiltro === tipo ? "#8B1E2D" : "#555563", fontWeight:700, fontSize:13 }}>
              {tipo || "Todos los tipos"}
            </button>
          ))}
        </div>
      </div>}

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#7B7B88", marginBottom:8 }}>Estado</div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:2 }}>
          {[
            ["Todos", "Todos"],
            ["Disponible", "Disponible"],
            ["Vendido", "Vendido · por liquidar"],
            ["Liquidado", "Liquidado"],
          ].map(([valor, etiqueta]) => (
            <button key={valor} onClick={() => setEstadoFiltro(valor)} style={{ flex:"0 0 auto", border:0, borderRadius:999, padding:"10px 14px", background:estadoFiltro === valor ? "#8B1E2D" : "#FFFFFF", color:estadoFiltro === valor ? "#FFFFFF" : "#555563", fontWeight:700, fontSize:13 }}>
              {etiqueta}
            </button>
          ))}
        </div>
      </div>









      <div

        style={{

          display:"flex",

          flexDirection:"column",

          gap:"14px",

        }}

      >



        {

          filtrados.length > 0 ? (


            filtrados.map(item=>(


              <ProductCard

                key={item.id}

                articulo={item}
                feria={modoFeria}
                canal={canalSeleccionado === "Todos" ? null : canalSeleccionado}
                onQuickSale={setShowSale}

                onClick={(producto)=>{

                  setArticuloSeleccionado(producto);

                }}

              />


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

              No hay artículos disponibles

            </div>


          )

        }




      </div>









      {
        !showAddArticle && (

          <BottomNav


            onHome={onHome || onBack}



            onArticulos={()=>{

              if(onArticulos){

                onArticulos();

              }

              else{

                cargarArticulos();

              }

            }}



            // + CENTRAL = CREAR ARTÍCULO

            onAgregar={()=>{

              setShowAddArticle(true);

            }}



            onClientes={onClientes}



            onLiquidaciones={onLiquidaciones}
            onGastos={onGastos}


          />

        )
      }









      {
        showAddArticle && (

          <AddArticleSheet


            onClose={()=>{

              setShowAddArticle(false);

              cargarArticulos();

            }}


          />

        )
      }

      {showSale && <SaleSheet articulo={showSale} paymentQrSrc={paymentQrSrc} modoFeria={modoFeria} onClose={() => setShowSale(null)} onSold={(updated) => {
        setShowSale(null);
        setArticulos(current => current.map(item => String(item.id) === String(updated.id) ? { ...item, ...updated } : item));
        setPendientes(getPendingSales(ownerId).length);
      }} />}





    </div>

  );

}
