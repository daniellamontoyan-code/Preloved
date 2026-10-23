import { X, Camera, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import NewClientSheet from "./NewClientSheet";
import { generateArticleCode, createArticle } from "../lib/articles";
import { getClients } from "../lib/clients";
import { uploadArticleImage } from "../lib/storage";

const subcategories = {
  Ropa: ["Polos y tops", "Shorts", "Pantalones", "Faldas", "Vestidos", "Casacas", "Chompas"],
  Calzado: ["Zapatillas", "Tenis", "Sandalias", "Tacos", "Botas", "Mocasines"],
  Bolsos: ["Carteras", "Mochilas", "Bolsos de mano", "Canguros"],
  Accesorios: ["Joyas", "Gorros", "Cinturones", "Lentes", "Pañuelos"],
  Otros: [],
};


export default function AddArticleSheet({ onClose }) {

  const [showNewClient, setShowNewClient] = useState(false);

  const [codigo, setCodigo] = useState("");

  const [clientes, setClientes] = useState([]);

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [subcategoriaOtra, setSubcategoriaOtra] = useState("");
  const [talla, setTalla] = useState("");
  const [cliente, setCliente] = useState("");
  const [precio, setPrecio] = useState("");

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    cargarCodigo();
    cargarClientes();

  }, []);




  async function cargarCodigo(){

    const nuevoCodigo = await generateArticleCode();

    setCodigo(nuevoCodigo);

  }




  async function cargarClientes(){

    const listaClientes = await getClients();

    setClientes(listaClientes);

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



    const articulo = await createArticle({

      descripcion,

      categoria,
      subcategoria: subcategoria === "Otra" ? subcategoriaOtra.trim() : subcategoria,
      talla,

      cliente,

      precio:Number(precio),

      foto:urlFoto,

    });





    if(articulo){

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
            Nuevo artículo
          </h2>


          <button
            onClick={onClose}
            style={circleButton}
          >

            <X size={20}/>

          </button>


        </div>






        <label
          style={{
            height:"150px",
            borderRadius:"24px",
            background:"#FFF0F3",
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            alignItems:"center",
            color:"#C0003B",
            marginBottom:"20px",
            cursor:"pointer",
            overflow:"hidden",
          }}
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
                <Camera size={35}/>

                <p style={{color:"#777"}}>
                  Tomar foto
                </p>
              </>

            )

          }



          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={seleccionarFoto}
            style={{
              display:"none",
            }}
          />


        </label>







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

        </select>

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

                {item.nombre}

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







        <input
          placeholder="Precio"
          type="number"
          value={precio}
          onChange={(e)=>setPrecio(e.target.value)}
          style={inputStyle}
        />







        <div style={infoBox}>

          <span>Código</span>

          <strong style={{color:"#C0003B"}}>
            {codigo}
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
            : "Guardar artículo"
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



const createButton = {

  border:"none",
  background:"transparent",
  color:"#C0003B",
  fontWeight:"600",
  display:"flex",
  alignItems:"center",
  gap:"6px",
  marginBottom:"14px",

};



const infoBox = {

  display:"flex",
  justifyContent:"space-between",
  background:"#FFF0F3",
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
  background:"#C0003B",
  color:"#fff",
  fontSize:"18px",
  fontWeight:"700",

};



const circleButton = {

  border:"none",
  background:"#F3F3F7",
  width:"40px",
  height:"40px",
  borderRadius:"50%",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",

};
