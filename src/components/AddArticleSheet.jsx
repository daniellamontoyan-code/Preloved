import { X, Camera, ImagePlus, Plus, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import NewClientSheet from "./NewClientSheet";
import { generateArticleCode, createArticle, updateArticle } from "../lib/articles";
import { getClients } from "../lib/clients";
import { uploadArticleImage } from "../lib/storage";
import { createSharedArticleCategory, DEFAULT_ARTICLE_CATEGORIES, getSharedArticleCategories } from "../lib/categories";

const subcategories = {
  Ropa: ["Polos y tops", "Shorts", "Pantalones", "Faldas", "Vestidos", "Casacas", "Chompas"],
  Calzado: ["Zapatillas", "Tenis", "Sandalias", "Tacos", "Botas", "Mocasines"],
  Bolsos: ["Carteras", "Mochilas", "Bolsos de mano", "Canguros"],
  Accesorios: ["Joyas", "Gorros", "Cinturones", "Lentes", "Pañuelos"],
  Otros: [],
};


export default function AddArticleSheet({ onClose, article = null, onSaved }) {

  const existingSubcategory = article?.subcategoria || "";
  const hasSuggestedSubcategory = (subcategories[article?.categoria] || []).includes(existingSubcategory);

  const [showNewClient, setShowNewClient] = useState(false);

  const [codigo, setCodigo] = useState("");

  const [clientes, setClientes] = useState([]);

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(article?.foto || null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [descripcion, setDescripcion] = useState(article?.descripcion || "");
  const [categoria, setCategoria] = useState(article?.categoria || "");
  const [categoriasCompartidas, setCategoriasCompartidas] = useState([]);
  const [categoriaNueva, setCategoriaNueva] = useState("");
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [subcategoria, setSubcategoria] = useState(!existingSubcategory ? "" : hasSuggestedSubcategory ? existingSubcategory : "Otra");
  const [subcategoriaOtra, setSubcategoriaOtra] = useState(hasSuggestedSubcategory ? "" : existingSubcategory);
  const [talla, setTalla] = useState(article?.talla || "");
  const [publicoObjetivo, setPublicoObjetivo] = useState(article?.publico_objetivo || "");
  const [generoMenuOpen, setGeneroMenuOpen] = useState(false);
  const [cliente, setCliente] = useState(String(article?.cliente?.id || article?.cliente || ""));
  const [precio, setPrecio] = useState(article?.precio ?? "");
  const [precioWeb, setPrecioWeb] = useState(article?.precio_web ?? article?.precio ?? "");
  const [publicarFeria, setPublicarFeria] = useState(article?.publicar_feria ?? true);
  const [publicarWeb, setPublicarWeb] = useState(article?.publicar_web ?? true);

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if (!article) cargarCodigo();
    cargarClientes();
    getSharedArticleCategories().then(setCategoriasCompartidas);

  }, []);




  async function cargarCodigo(){

    const nuevoCodigo = await generateArticleCode();

    setCodigo(nuevoCodigo);

  }




  async function cargarClientes(){

    const listaClientes = await getClients();

    setClientes(listaClientes);

  }

  async function agregarCategoria() {
    const result = await createSharedArticleCategory(categoriaNueva);
    if (result.error) {
      alert(result.error);
      setGuardandoCategoria(false);
      return;
    }
    setCategoriasCompartidas((current) => [...new Set([...current, result.category])].sort((a, b) => a.localeCompare(b, "es")));
    setCategoria(result.category);
    setCategoriaNueva("");
    setSubcategoria("");
    setSubcategoriaOtra("");
    setGuardandoCategoria(false);
  }





  function seleccionarFoto(e){

    const archivo = e.target.files[0];

    if(!archivo) return;


    setFoto(archivo);

    setPreview(URL.createObjectURL(archivo));

  }





  async function guardarArticulo(){


    if(!descripcion.trim()){

      alert("Ingresa la descripción");

      return;

    }

    if (!publicarFeria && !publicarWeb) {
      alert("Elige al menos un canal: feria o catálogo web.");
      return;
    }

    if (publicarFeria && (!Number(precio) || Number(precio) <= 0)) {
      alert("Ingresa un precio válido para la feria.");
      return;
    }

    if (publicarWeb && (!Number(precioWeb) || Number(precioWeb) <= 0)) {
      alert("Ingresa un precio válido para el catálogo web.");
      return;
    }



    setLoading(true);



    let urlFoto = null;



    if(foto){

      urlFoto = await uploadArticleImage(foto);

      if(!urlFoto){

        alert("No se pudo preparar o subir la foto. Inténtalo nuevamente.");

        setLoading(false);

        return;

      }

    }



    const datosArticulo = {

      codigo,
      descripcion,

      categoria,
      subcategoria: subcategoria === "Otra" ? subcategoriaOtra.trim() : subcategoria,
      talla,
      publico_objetivo: publicoObjetivo,

      cliente,

      precio:Number(precio),
      precio_web:Number(precioWeb),
      publicar_feria:publicarFeria,
      publicar_web:publicarWeb,

      foto:urlFoto,

    };

    const articulo = article
      ? await updateArticle(article.id, { ...datosArticulo, foto: urlFoto || article.foto })
      : await createArticle(datosArticulo);





    if(articulo){

      onSaved?.(articulo);
      onClose();

    }
    else{

      alert("No se pudo guardar el artículo");

    }



    setLoading(false);

  }







  return (
    <>


      <div
        style={{
          position:"fixed",
          inset:0,
          background:"rgba(0,0,0,.25)",
          backdropFilter:"blur(8px)",
          zIndex:20,
        }}
        onClick={onClose}
      />




      <div
        style={{
          position:"fixed",
          bottom:0,
          left:"50%",
          transform:"translateX(-50%)",
          width:"100%",
          maxWidth:"430px",
          height:"90vh",
          background:"#fff",
          borderRadius:"32px 32px 0 0",
          padding:"24px",
          overflowY:"auto",
          zIndex:30,
        }}
      >



        <div
          style={{
            width:"45px",
            height:"5px",
            background:"#ddd",
            borderRadius:"20px",
            margin:"0 auto 20px",
          }}
        />




        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            marginBottom:"25px",
          }}
        >

          <h2
            style={{
              margin:0,
              fontSize:"26px",
            }}
          >
            {article ? "Editar artículo" : "Nuevo artículo"}
          </h2>


          <button
            onClick={onClose}
            style={circleButton}
          >

            <X size={20}/>

          </button>


        </div>






          <div
          style={{
            height:"150px",
            borderRadius:"24px",
            background:"#FFC9E3",
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            alignItems:"center",
            color:"#8B1E2D",
            marginBottom:"20px",
            overflow:"hidden",
            cursor:"pointer",
          }}
          role="button"
          tabIndex={0}
          aria-label="Elegir una foto de la galería"
          onClick={() => galleryInputRef.current?.click()}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") galleryInputRef.current?.click(); }}
        >


          {
            preview ? (

              <img
                src={preview}
                alt="preview"
                style={{
                  width:"100%",
                  height:"100%",
                  objectFit:"cover",
                }}
              />

            ) : (

              <>
                <ImagePlus size={35}/>
                <p style={{color:"#777"}}>Agrega una foto</p>
              </>

            )

          }



          </div>

          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={seleccionarFoto} style={{ display:"none" }} />
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={seleccionarFoto} style={{ display:"none" }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            <button type="button" onClick={() => cameraInputRef.current?.click()} style={{ height:46, border:0, borderRadius:15, background:"#FFC9E3", color:"#8B1E2D", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              <Camera size={18}/> Tomar foto
            </button>
            <button type="button" onClick={() => galleryInputRef.current?.click()} style={{ height:46, border:0, borderRadius:15, background:"#FFC9E3", color:"#8B1E2D", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              <ImagePlus size={18}/> Elegir de galería
            </button>
          </div>







        <input
          placeholder="Descripción"
          value={descripcion}
          onChange={(e)=>setDescripcion(e.target.value)}
          style={inputStyle}
        />






        <select
          value={categoria}
          onChange={(e)=>{
            setCategoria(e.target.value);
            setSubcategoria("");
            setSubcategoriaOtra("");
          }}
          style={inputStyle}
        >

          <option value="">
            Categoría
          </option>

          <option>Ropa</option>
          <option>Calzado</option>
          <option>Bolsos</option>
          <option>Accesorios</option>
          <option>Otros</option>
          {categoriasCompartidas
            .filter((nombre) => !DEFAULT_ARTICLE_CATEGORIES.includes(nombre) && nombre !== "Otros")
            .map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}

        </select>

        {categoria === "Otros" && (
          <div style={{ display:"flex", gap:8, marginTop:-6, marginBottom:14 }}>
            <input
              placeholder="Nombre de nueva categoría"
              value={categoriaNueva}
              onChange={(event) => setCategoriaNueva(event.target.value)}
              style={{ ...inputStyle, marginBottom:0, flex:1 }}
              aria-label="Nombre de nueva categoría compartida"
            />
            <button
              type="button"
              disabled={!categoriaNueva.trim() || guardandoCategoria}
              onClick={async () => { setGuardandoCategoria(true); await agregarCategoria(); }}
              style={{ border:0, borderRadius:14, padding:"0 15px", minHeight:50, background:"#8B1E2D", color:"white", fontWeight:800, opacity:!categoriaNueva.trim() || guardandoCategoria ? .55 : 1 }}
            >
              {guardandoCategoria ? "Guardando…" : "Crear para ambas"}
            </button>
          </div>
        )}

        {categoria && (
          <>
            <select
              value={subcategoria}
              onChange={(e)=>{
                setSubcategoria(e.target.value);
                setSubcategoriaOtra("");
              }}
              style={inputStyle}
            >
              <option value="">Subcategoría (opcional)</option>
              {(subcategories[categoria] || []).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
              <option value="Otra">Otra</option>
            </select>
            {subcategoria === "Otra" && (
              <input
                placeholder="Escribe la subcategoría"
                value={subcategoriaOtra}
                onChange={(e)=>setSubcategoriaOtra(e.target.value)}
                style={inputStyle}
              />
            )}
          </>
        )}

        <input
          placeholder="Talla (S, M, 38, única) · opcional"
          value={talla}
          onChange={(e)=>setTalla(e.target.value)}
          style={inputStyle}
        />

        <div style={{ position: "relative", marginBottom: "14px" }}>
          <button
            type="button"
            aria-label="Elegir género"
            aria-expanded={generoMenuOpen}
            onClick={() => setGeneroMenuOpen(open => !open)}
            style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0, background: "#fff", color: publicoObjetivo ? "#222" : "#777", textAlign: "left" }}
          >
            <span>{publicoObjetivo || "Género (opcional)"}</span>
            <ChevronDown size={18} />
          </button>
          {generoMenuOpen && (
            <div role="group" aria-label="Opciones de género" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 40, display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px", border: "1px solid #EAD5DA", borderRadius: "16px", background: "#fff", boxShadow: "0 10px 25px rgba(50, 20, 30, .14)" }}>
              {["Mujer", "Hombre", "Unisex"].map(genero => (
                <button
                  key={genero}
                  type="button"
                  aria-pressed={publicoObjetivo === genero}
                  onClick={() => { setPublicoObjetivo(genero); setGeneroMenuOpen(false); }}
                  style={{ flex: "1 1 auto", minHeight: "40px", padding: "0 13px", border: `1px solid ${publicoObjetivo === genero ? "#8B1E2D" : "#E5E7EB"}`, borderRadius: "12px", color: publicoObjetivo === genero ? "#8B1E2D" : "#594137", background: publicoObjetivo === genero ? "#FFC9E3" : "#fff", fontWeight: 700 }}
                >
                  {genero}
                </button>
              ))}
              {publicoObjetivo && <button type="button" onClick={() => { setPublicoObjetivo(""); setGeneroMenuOpen(false); }} style={{ width: "100%", minHeight: "34px", border: 0, color: "#777", background: "transparent" }}>Quitar género</button>}
            </div>
          )}
        </div>







        <select
          value={cliente}
          onChange={(e)=>setCliente(e.target.value)}
          style={inputStyle}
        >

          <option value="">
            Sin cliente
          </option>


          {
            clientes.map((item)=>(

              <option
                key={item.id}
                value={item.id}
              >

                {item.nombre}{item.compartido ? " · Ambas" : ""}

              </option>

            ))
          }


        </select>






        <button
          onClick={()=>setShowNewClient(true)}
          style={createButton}
        >

          <Plus size={18}/>

          Crear cliente

        </button>







        <div style={channelBox}>
          <strong style={{display:"block", marginBottom:8}}>¿Dónde estará disponible?</strong>
          <label style={channelOption}>
            <input type="checkbox" checked={publicarFeria} onChange={e=>setPublicarFeria(e.target.checked)} />
            Feria
          </label>
          <label style={channelOption}>
            <input type="checkbox" checked={publicarWeb} onChange={e=>setPublicarWeb(e.target.checked)} />
            Catálogo web
          </label>
        </div>

        {publicarFeria && <input
          aria-label="Precio de feria"
          placeholder="Precio de feria"
          type="number"
          step="0.01"
          value={precio}
          onChange={(e)=>setPrecio(e.target.value)}
          style={inputStyle}
        />}

        {publicarWeb && <input
          aria-label="Precio del catálogo web"
          placeholder="Precio del catálogo web"
          type="number"
          step="0.01"
          value={precioWeb}
          onChange={(e)=>setPrecioWeb(e.target.value)}
          style={inputStyle}
        />}







        <div style={infoBox}>

            <span>Código</span>

          <strong style={{color:"#8B1E2D"}}>
            {article?.codigo || codigo}
          </strong>

        </div>







        <div style={stateBox}>

          <span>Estado</span>


          <div
            style={{
              display:"flex",
              alignItems:"center",
              gap:"8px",
              color:"#16A34A",
              fontWeight:"700",
            }}
          >

            <span
              style={{
                width:"10px",
                height:"10px",
                borderRadius:"50%",
                background:"#22C55E",
              }}
            />

            Disponible

          </div>


        </div>







        <button
          onClick={guardarArticulo}
          disabled={loading}
          style={saveButton}
        >

          {
            loading
            ? "Guardando..."
            : article ? "Guardar cambios" : "Guardar artículo"
          }

        </button>



      </div>






      {
        showNewClient && (

          <NewClientSheet

            onClose={()=>setShowNewClient(false)}

            onCreated={(clienteNuevo)=>{

              setClientes((prev)=>[
                clienteNuevo,
                ...prev
              ]);

              setCliente(clienteNuevo.id);

            }}

          />

        )
      }





    </>
  );
}





const inputStyle = {

  width:"100%",
  height:"56px",
  borderRadius:"18px",
  border:"1px solid #E5E7EB",
  padding:"0 18px",
  fontSize:"16px",
  marginBottom:"14px",

};

const channelBox = {
  background:"#F5EBDD",
  border:"1px solid #EAD5DA",
  borderRadius:"18px",
  padding:"14px 16px",
  marginBottom:"14px",
  color:"#594137",
};

const channelOption = {
  display:"flex",
  alignItems:"center",
  gap:"9px",
  minHeight:"34px",
  fontWeight:600,
};



const createButton = {

  border:"none",
  background:"transparent",
  color:"#8B1E2D",
  fontWeight:"600",
  display:"flex",
  alignItems:"center",
  gap:"6px",
  marginBottom:"14px",

};



const infoBox = {

  display:"flex",
  justifyContent:"space-between",
  background:"#FFC9E3",
  borderRadius:"18px",
  padding:"16px 18px",
  marginBottom:"12px",

};



const stateBox = {

  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  background:"#ECFDF3",
  borderRadius:"18px",
  padding:"16px 18px",
  marginBottom:"20px",

};



const saveButton = {

  width:"100%",
  height:"60px",
  border:"none",
  borderRadius:"22px",
  background:"#8B1E2D",
  color:"#fff",
  fontSize:"18px",
  fontWeight:"700",

};



const circleButton = {

  border:"none",
  background:"#F5EBDD",
  width:"40px",
  height:"40px",
  borderRadius:"50%",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",

};
