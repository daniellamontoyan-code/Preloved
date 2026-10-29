import { X } from "lucide-react";
import { useState } from "react";
import { createClient } from "../lib/clients";


export default function NewClientSheet({ onClose, onCreated }) {

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [comision, setComision] = useState("");
  const [compartido, setCompartido] = useState(false);
  const [loading, setLoading] = useState(false);



  async function guardarCliente() {


    if (!nombre.trim()) {
      alert("Escribe el nombre del cliente");
      return;
    }


    setLoading(true);


    try {

      const nuevoCliente = await createClient({
        nombre,
        telefono,
        porcentaje_comision: Number(comision),
        compartido,
      });



      if (!nuevoCliente) {

        alert("No se pudo guardar el cliente");

        setLoading(false);

        return;

      }



      if(onCreated){

        onCreated(nuevoCliente);

      }


      onClose();



    } catch(error){

      console.error(error);

      alert("Ocurrió un error al guardar");

    }



    setLoading(false);

  }



  return (
    <>

      <div
        style={{
          position:"fixed",
          inset:0,
          background:"rgba(0,0,0,.3)",
          backdropFilter:"blur(8px)",
          zIndex:100,
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
          background:"#fff",
          borderRadius:"32px 32px 0 0",
          padding:"24px",
          paddingBottom:"40px",
          zIndex:101,
        }}
      >


        <div
          style={{
            width:"45px",
            height:"5px",
            background:"#DDD",
            borderRadius:"20px",
            margin:"0 auto 24px",
          }}
        />



        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            marginBottom:"28px",
          }}
        >

          <h2
            style={{
              margin:0,
              fontSize:"26px",
              fontWeight:"700",
            }}
          >
            Nuevo cliente
          </h2>


          <button
            onClick={onClose}
            style={closeButton}
          >
            <X size={20}/>
          </button>

        </div>

        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e)=>setNombre(e.target.value)}
          style={inputStyle}
        />



        <input
          placeholder="Teléfono"
          value={telefono}
          onChange={(e)=>setTelefono(e.target.value)}
          style={inputStyle}
        />



        <div
          style={{
            position:"relative",
            marginBottom:"14px",
          }}
        >

          <input
            placeholder="Comisión"
            type="number"
            step="0.01"
            value={comision}
            onChange={(e)=>setComision(e.target.value)}
            style={{
              ...inputStyle,
              marginBottom:0,
              paddingRight:"45px",
            }}
          />


          <span
            style={{
              position:"absolute",
              right:"18px",
              top:"50%",
              transform:"translateY(-50%)",
            }}
          >
            %
          </span>

        </div>


        <label style={{ display:"flex", alignItems:"flex-start", gap:11, margin:"4px 0 22px", color:"#42424D", fontSize:14, lineHeight:1.4, fontWeight:650 }}>
          <input type="checkbox" checked={compartido} onChange={event => setCompartido(event.target.checked)} style={{ width:19, height:19, accentColor:"#C0003B", flexShrink:0, marginTop:1 }} />
          <span>Cliente de ambas (Dani y Mafer)</span>
        </label>




        <button
          onClick={guardarCliente}
          disabled={loading}
          style={saveButton}
        >
          {
            loading
            ? "Guardando..."
            : "Guardar cliente"
          }
        </button>


      </div>

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



const closeButton = {

  width:"40px",
  height:"40px",
  borderRadius:"50%",
  border:"none",
  background:"#F3F3F7",
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
