import { useEffect, useState } from "react";
import { ChevronLeft, Wifi, WifiOff } from "lucide-react";

import ProductCard from "../components/ProductCard";
import DetalleArticulo from "./DetalleArticulo";
import BottomNav from "../components/BottomNav";
import AddArticleSheet from "../components/AddArticleSheet";
import SaleSheet from "../components/SaleSheet";

import { getArticles, getPendingSales, syncPendingSales } from "../lib/articles";
import { getClients } from "../lib/clients";



export default function Articulos({ 

  categoria, 
  ownerId,
  paymentQrSrc,
  onBack,
  onHome,
  onArticulos,
  onClientes,
  onLiquidaciones,

}) {


  const [articulos, setArticulos] = useState([]);
  const [clientes, setClientes] = useState([]);
const [clienteSeleccionado, setClienteSeleccionado] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [filtro, setFiltro] = useState("Todos");

  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showSale, setShowSale] = useState(null);
  const [modoFeria, setModoFeria] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState(getPendingSales(ownerId).length);







  useEffect(()=>{

    cargarArticulos();
    cargarClientes();

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





async function cargarClientes() {
  const data = await getClients();
  setClientes(data || []);
}

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
      if (valor === "vendido" || valor === "liquidado") return 2;
      return 1;
    };

    lista.sort((a, b) => {
      const diferenciaEstado =
        prioridadEstado(a.estado) - prioridadEstado(b.estado);

      if (diferenciaEstado !== 0) return diferenciaEstado;

      return (a.descripcion || "").localeCompare(b.descripcion || "");
    });



    setArticulos(lista);


  }







  let filtrados = articulos.filter(item =>

    item.descripcion

      .toLowerCase()

      .includes(

        busqueda.toLowerCase()

      )

  );

  if (modoFeria) filtrados = filtrados.filter(item => item.estado === "Disponible" && item.publicar_feria !== false);





    if (clienteSeleccionado) {
    const cliente = clientes.find(
      item => String(item.id) === String(clienteSeleccionado)
    );

    if (cliente) {
      const nombreCliente = (cliente.nombre || "").trim().toLowerCase();

      filtrados = filtrados.filter(item => {
        const asignado = item.cliente;
        const valoresCliente = [
          item.cliente_id,
          typeof asignado === "object" ? asignado?.id : asignado,
          typeof asignado === "object" ? asignado?.nombre : null,
        ]
          .filter(Boolean)
          .map(String);

        return (
          valoresCliente.includes(String(cliente.id)) ||
          valoresCliente.some(
            valor => valor.trim().toLowerCase() === nombreCliente
          )
        );
      });
    }
  }


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

          gap:"12px",

          marginBottom:"24px",

        }}

      >



        <button

          onClick={onBack}

          style={{

            border:"none",

            background:"#F3F3F7",

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

            color:"#1F1F28",

          }}

        >

          {categoria || "Artículos"}

        </h1>



      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, color: online ? "#177245" : "#A45B00", fontSize:13, fontWeight:700 }}>
          {online ? <Wifi size={17}/> : <WifiOff size={17}/>}
          {online ? "Con internet" : "Sin internet · catálogo guardado"}
        </div>
        {pendientes > 0 && <span style={{ fontSize:12, color:"#A45B00", fontWeight:700 }}>{pendientes} venta{pendientes === 1 ? "" : "s"} por sincronizar</span>}
      </div>
      <button onClick={() => setModoFeria(value => !value)} style={{ width:"100%", height:48, marginBottom:18, border:0, borderRadius:15, background: modoFeria ? "#C0003B" : "#FFF0F3", color: modoFeria ? "white" : "#7B1730", fontSize:15, fontWeight:800 }}>
        {modoFeria ? "✓ Modo feria · solo disponibles" : "Activar modo feria"}
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








      <div

        style={{

          display:"flex",

          gap:"10px",
          overflowX: "auto",

          marginBottom:"20px",

        }}

      >


        {

          clientes.map((cliente) => (
  <button
    key={cliente.id}
    onClick={() =>
      setClienteSeleccionado(actual =>
        String(actual) === String(cliente.id) ? "" : String(cliente.id)
      )
    }
    style={{
      flex: "0 0 auto",
      padding: "0 18px",
      height: "40px",
      borderRadius: "20px",
      border: "none",
      background:
        String(clienteSeleccionado) === String(cliente.id)
          ? "#C0003B"
          : "#FFFFFF",
      color:
        String(clienteSeleccionado) === String(cliente.id)
          ? "#FFFFFF"
          : "#7B7B88",
      fontWeight: "600",
      fontSize: "14px",
    }}
  >
    {cliente.nombre}
  </button>
))

        }


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
