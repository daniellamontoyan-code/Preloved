import { X } from "lucide-react";
import { useState } from "react";

import { confirmSale } from "../lib/articles";


export default function SaleSheet({ articulo, onClose, onSold }) {


  const [precioVenta, setPrecioVenta] = useState(
    articulo.precio
  );


  const [metodoPago, setMetodoPago] = useState("");

  const [loading, setLoading] = useState(false);





  async function guardarVenta(){


    if(!metodoPago){

      alert("Selecciona un método de pago");

      return;

    }




    setLoading(true);



    const venta = {

      id: articulo.id,

      precio_venta: Number(precioVenta),

      metodo_pago: metodoPago,

    };





    const actualizado = await confirmSale(venta);




    if(actualizado){

      onSold(actualizado);

      onClose();

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
          zIndex:200,
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
          background:"#FFFFFF",
          borderRadius:"32px 32px 0 0",
          padding:"24px",
          paddingBottom:"40px",
          zIndex:201,
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
            marginBottom:"25px",
          }}
        >

          <h2
            style={{
              margin:0,
              fontSize:"24px",
            }}
          >

            Confirmar venta

          </h2>



          <button
            onClick={onClose}
            style={{
              width:"40px",
              height:"40px",
              borderRadius:"50%",
              border:"none",
              background:"#F3F3F7",
            }}
          >

            <X size={20}/>

          </button>

        </div>






        <div style={boxStyle}>

          {articulo.descripcion}

        </div>





        <input
          type="number"
          value={precioVenta}
          onChange={(e)=>setPrecioVenta(e.target.value)}
          style={inputStyle}
          placeholder="Precio vendido"
        />





        <select
          value={metodoPago}
          onChange={(e)=>setMetodoPago(e.target.value)}
          style={inputStyle}
        >

          <option value="">
            Método de pago
          </option>

          <option value="Yape">
            Yape
          </option>

          <option value="Plin">
            Plin
          </option>

          <option value="Efectivo">
            Efectivo
          </option>

          <option value="Transferencia">
            Transferencia
          </option>


        </select>





        <button
          onClick={guardarVenta}
          disabled={loading}
          style={buttonStyle}
        >

          {
            loading
            ? "Guardando..."
            : "Confirmar venta"
          }

        </button>


      </div>


    </>

  );

}





const inputStyle={

  width:"100%",
  height:"56px",
  borderRadius:"18px",
  border:"1px solid #E5E7EB",
  padding:"0 18px",
  fontSize:"16px",
  marginBottom:"14px",

};



const boxStyle={

  background:"#F8F6FF",
  borderRadius:"20px",
  padding:"16px",
  marginBottom:"16px",
  fontWeight:"600",

};



const buttonStyle={

  width:"100%",
  height:"60px",
  border:"none",
  borderRadius:"22px",
  background:"#7C5CFC",
  color:"#FFFFFF",
  fontSize:"18px",
  fontWeight:"700",

};