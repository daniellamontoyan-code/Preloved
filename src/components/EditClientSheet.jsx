import { useState } from "react";
import { X } from "lucide-react";

import { updateClient, deleteClient } from "../lib/clients";
import { CLIENT_COLORS } from "../lib/clientColors";



export default function EditClientSheet({

  cliente,
  onClose,
  onUpdated,
  onDeleted,

}) {


  const [nombre,setNombre] = useState(cliente.nombre);

  const [comision,setComision] = useState(
    cliente.porcentaje_comision
  );

  const [compartido,setCompartido] = useState(Boolean(cliente.compartido));
  const [color,setColor] = useState(cliente.color || CLIENT_COLORS[0].valor);

  const [loading,setLoading] = useState(false);







  async function guardar(){


    setLoading(true);



    const actualizado = await updateClient(

      cliente.id,

      {

        nombre,

        porcentaje_comision:comision,

        compartido,

        color,

      }

    );



    if(actualizado){

      onUpdated(actualizado);

      onClose();

    }



    setLoading(false);


  }









  async function eliminar(){


    const confirmar = window.confirm(

      "¿Eliminar este cliente?"

    );



    if(!confirmar) return;



    const eliminado = await deleteClient(

      cliente.id

    );



    if(eliminado){

      onDeleted();

      onClose();

    }


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
          maxHeight:"90vh",
          overflowY:"auto",

          background:"#FFFFFF",

          borderRadius:"32px 32px 0 0",

          padding:"25px",

          zIndex:30,

        }}

      >




        <div

          style={{

            display:"flex",

            justifyContent:"space-between",

            alignItems:"center",

            marginBottom:"25px",

          }}

        >


          <h2 style={{margin:0}}>

            Editar cliente

          </h2>



          <button

            onClick={onClose}

            style={circle}

          >

            <X size={20}/>

          </button>


        </div>






        <input

          value={nombre}

          onChange={(e)=>setNombre(e.target.value)}

          placeholder="Nombre"

          style={input}

        />





        <input

          type="number"

          value={comision}

          onChange={(e)=>setComision(e.target.value)}

          placeholder="Comisión %"

          style={input}

        />

        <label style={{ display:"flex", alignItems:"flex-start", gap:11, margin:"2px 0 22px", color:"#594137", fontSize:14, lineHeight:1.4, fontWeight:650 }}>
          <input type="checkbox" checked={compartido} onChange={event => setCompartido(event.target.checked)} style={{ width:19, height:19, accentColor:"#8B1E2D", flexShrink:0, marginTop:1 }} />
          <span>Cliente de ambas (Dani y Mafer)</span>
        </label>

        <div style={{ marginBottom:20 }}>
          <div style={{ marginBottom:10, color:"#594137", fontSize:14, fontWeight:750 }}>Color para identificar sus prendas</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            {CLIENT_COLORS.map(option => <button key={option.valor} type="button" title={option.nombre} aria-label={`Color ${option.nombre}`} aria-pressed={color === option.valor} onClick={() => setColor(option.valor)} style={{ width:34, height:34, borderRadius:"50%", background:option.valor, border:color === option.valor ? "3px solid #383B3B" : "2px solid white", boxShadow:"0 0 0 1px rgba(89,65,55,.24)", cursor:"pointer" }}/>) }
          </div>
        </div>







        <button

          onClick={guardar}

          disabled={loading}

          style={save}

        >

          {loading
            ?"Guardando..."
            :"Guardar cambios"
          }

        </button>







        <button

          onClick={eliminar}

          style={deleteButton}

        >

          Eliminar cliente

        </button>





      </div>


    </>


  );


}







const input={

  width:"100%",

  height:"56px",

  borderRadius:"18px",

  border:"1px solid #E5E7EB",

  padding:"0 18px",

  fontSize:"16px",

  marginBottom:"14px",

};



const save={

  width:"100%",

  height:"60px",

  border:"none",

  borderRadius:"22px",

  background:"#8B1E2D",

  color:"#FFFFFF",

  fontSize:"17px",

  fontWeight:"700",

};



const deleteButton={

  width:"100%",

  marginTop:"18px",

  border:"none",

  background:"transparent",

  color:"#DC2626",

  fontSize:"15px",

  fontWeight:"700",

};



const circle={

  width:"40px",

  height:"40px",

  borderRadius:"50%",

  border:"none",

  background:"#F5EBDD",

  display:"flex",

  alignItems:"center",

  justifyContent:"center",

};
