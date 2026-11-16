import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, Filter, Search, Wifi, WifiOff, X } from "lucide-react";

import ProductCard from "../components/ProductCard";
import DetalleArticulo from "./DetalleArticulo";
import BottomNav from "../components/BottomNav";
import AddArticleSheet from "../components/AddArticleSheet";
import SaleSheet from "../components/SaleSheet";

import { getArticles, getPendingSales, syncPendingSales } from "../lib/articles";
import { getClients } from "../lib/clients";
import { getClientColor } from "../lib/clientColors";

const prioridadEstado = (estado) => String(estado || "").trim().toLowerCase() === "disponible" ? 0 : 1;



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
  onEstadisticas,

}) {


  const [articulos, setArticulos] = useState([]);
  const [clientesById, setClientesById] = useState(new Map());
  const [busqueda, setBusqueda] = useState("");
  const [canalSeleccionado, setCanalSeleccionado] = useState(canalInicial);
  const [categoriaFiltro, setCategoriaFiltro] = useState(categoria || "Todos");
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState(subcategoriaInicial);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [soloIncompletos, setSoloIncompletos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const posicionListaRef = useRef(0);
  const debeRestaurarPosicionRef = useRef(false);

  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showSale, setShowSale] = useState(null);
  const [modoFeria, setModoFeria] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState(getPendingSales(ownerId).length);

  useLayoutEffect(() => {
    if (articuloSeleccionado || !debeRestaurarPosicionRef.current) return;
    debeRestaurarPosicionRef.current = false;
    requestAnimationFrame(() => window.scrollTo({ top: posicionListaRef.current, behavior: "auto" }));
  }, [articuloSeleccionado]);







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


    const [data, clientesData] = await Promise.all([getArticles(), getClients()]);

    setClientesById(new Map((clientesData || []).map(cliente => [String(cliente.id), cliente])));



    let lista = data;



    if(categoria){

      lista = lista.filter(

        item => item.categoria === categoria

      );

    }




    lista.sort((a, b) => {
      const diferenciaEstado =
        prioridadEstado(a.estado) - prioridadEstado(b.estado);

      if (diferenciaEstado !== 0) return diferenciaEstado;

      return (a.descripcion || "").localeCompare(b.descripcion || "");
    });



    setArticulos(lista);


  }







  const textoBusqueda = busqueda.trim().toLowerCase();
  const faltanDatos = item => !String(item.categoria || "").trim() || !String(item.subcategoria || "").trim();
  const incompletosCount = articulos.filter(faltanDatos).length;
  const filtrosActivos = Number(canalSeleccionado !== "Todos") + Number(categoriaFiltro !== "Todos")
    + Number(Boolean(subcategoriaFiltro)) + Number(estadoFiltro !== "Todos") + Number(soloIncompletos);
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
    return coincideBusqueda && coincideCategoria && coincideSubcategoria && coincideEstado && coincideCanal
      && (!soloIncompletos || faltanDatos(item));
  });

  if (modoFeria) filtrados = filtrados.filter(item => item.estado === "Disponible" && item.publicar_feria !== false);

  const subcategoriasDisponibles = [...new Set(articulos
    .filter(item => categoriaFiltro === "Todos" || item.categoria === categoriaFiltro)
    .map(item => item.subcategoria)
    .filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));

  filtrados.sort((a, b) => {
    return prioridadEstado(a.estado) - prioridadEstado(b.estado)
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
      className="app-page app-page-articles"
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
      <div className="articles-quick-tools">
        <label className="articles-search">
          <Search size={19}/>
          <input placeholder="Buscar por nombre o código" value={busqueda} onChange={event => setBusqueda(event.target.value)}/>
        </label>
        <button className={`articles-filter-toggle${mostrarFiltros ? " active" : ""}`} type="button" onClick={() => setMostrarFiltros(value => !value)} aria-expanded={mostrarFiltros}>
          {mostrarFiltros ? <X size={18}/> : <Filter size={18}/>} Filtros{filtrosActivos > 0 && <span>{filtrosActivos}</span>}
        </button>
        <button className={`articles-fair-toggle${modoFeria ? " active" : ""}`} type="button" onClick={() => setModoFeria(value => { const next = !value; if (next) setCanalSeleccionado("Feria"); return next; })}>
          {modoFeria ? "✓ Feria" : "Modo feria"}
        </button>
      </div>

      {mostrarFiltros && <section className="articles-filter-panel" aria-label="Filtros de artículos">
        <label className="articles-filter-field">Canal
          <select value={canalSeleccionado} onChange={event => { setCanalSeleccionado(event.target.value); setModoFeria(false); }}>
            <option value="Todos">Todos los canales</option><option value="Feria">Feria</option><option value="Web">Página web</option>
          </select>
        </label>
        <label className="articles-filter-field">Categoría
          <select value={categoriaFiltro} onChange={event => { setCategoriaFiltro(event.target.value); setSubcategoriaFiltro(""); }}>
            <option value="Todos">Todas las categorías</option>{categoriasDisponibles.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
          </select>
        </label>
        <label className="articles-filter-field">Subcategoría
          <select value={subcategoriaFiltro} onChange={event => setSubcategoriaFiltro(event.target.value)}>
            <option value="">Todas las subcategorías</option>{subcategoriasDisponibles.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </label>
        <label className="articles-filter-field">Estado
          <select value={estadoFiltro} onChange={event => setEstadoFiltro(event.target.value)}>
            <option value="Todos">Todos los estados</option><option value="Disponible">Disponible</option><option value="Vendido">Vendido · por liquidar</option><option value="Liquidado">Liquidado</option>
          </select>
        </label>
        <label className="articles-incomplete-toggle">
          <input type="checkbox" checked={soloIncompletos} onChange={event => setSoloIncompletos(event.target.checked)}/>
          <span>Sin categoría o subcategoría</span><strong>{incompletosCount}</strong>
        </label>
        <button className="articles-clear-filters" type="button" onClick={() => { setCanalSeleccionado("Todos"); setCategoriaFiltro("Todos"); setSubcategoriaFiltro(""); setEstadoFiltro("Todos"); setSoloIncompletos(false); setModoFeria(false); }}>Limpiar filtros</button>
      </section>}

      <div className="articles-result-count">{filtrados.length} artículo{filtrados.length === 1 ? "" : "s"}</div>

      <div
        className="app-article-grid"
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
                cliente={clientesById.get(String(item.cliente))}
                colorCliente={getClientColor(clientesById.get(String(item.cliente))?.color)}
                feria={modoFeria}
                canal={canalSeleccionado === "Todos" ? null : canalSeleccionado}
                onQuickSale={setShowSale}

                onClick={(producto)=>{
                  posicionListaRef.current = window.scrollY || document.documentElement.scrollTop;
                  debeRestaurarPosicionRef.current = true;
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
            onEstadisticas={onEstadisticas}


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
