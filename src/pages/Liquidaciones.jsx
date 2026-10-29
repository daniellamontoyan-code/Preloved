import { useEffect, useState } from "react";
import { ChevronLeft, Wallet, Users, Shirt, X } from "lucide-react";

import BottomNav from "../components/BottomNav";

import {
  getLiquidaciones,
  crearLiquidacion
} from "../lib/liquidaciones";

import { liquidarArticulosCliente } from "../lib/articles";



export default function Liquidaciones({

  onBack,
  onHome,
  onArticulos,
  onClientes,
  onAgregar,
  onGastos,

}) {


  const [clientes, setClientes] = useState([]);

  const [clienteLiquidar, setClienteLiquidar] = useState(null);


  const [resumen, setResumen] = useState({

    clientes:0,
    articulos:0,
    ventas:0,
    liquidar:0,
    ganancia:0,

  });



  const formato = (numero)=>{

    return Number(numero || 0).toFixed(2);

  };




  useEffect(()=>{

    cargarLiquidaciones();

  },[]);




  async function cargarLiquidaciones(){

    const data = await getLiquidaciones();

    setClientes(data.clientes);

    setResumen(data.resumen);

  }




  function calcularCliente(cliente){


    const total = Number(cliente.totalVenta || 0);

    const porcentaje = Number(cliente.porcentaje || 0);


    const comisionCherry =

      total * (porcentaje / 100);



    const montoCliente =

      total - comisionCherry;



    return {

      total,

      comisionCherry,

      montoCliente,

    };


  }





  async function confirmarLiquidacion(){


    if(!clienteLiquidar){

      return;

    }



    const guardado = await crearLiquidacion({

      ...clienteLiquidar,

      liquidar:

      calcularCliente(clienteLiquidar).montoCliente

    });



    if(!guardado){

      alert("No se pudo guardar la liquidación");

      return;

    }



    const resultado = await liquidarArticulosCliente(

      clienteLiquidar.id

    );



    if(resultado){

      setClienteLiquidar(null);

      cargarLiquidaciones();

    }


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

          marginBottom:"30px",

        }}

      >


        <button

          onClick={onBack}

          style={{

            width:"40px",

            height:"40px",

            borderRadius:"50%",

            border:"none",

            background:"#F3F3F7",

            display:"flex",

            alignItems:"center",

            justifyContent:"center",

          }}

        >

          <ChevronLeft size={22}/>

        </button>




        <h1

          style={{

            margin:"0 0 0 14px",

            fontSize:"28px",

            fontWeight:"800",

          }}

        >

          Liquidaciones

        </h1>


      </div>





      <div

        style={{

          background:"#C0003B",

          color:"#FFFFFF",

          borderRadius:"28px",

          padding:"24px",

          marginBottom:"24px",

        }}

      >


        <Wallet size={30}/>


        <h2

          style={{

            margin:"15px 0 5px",

            fontSize:"32px",

          }}

        >

          S/. {formato(resumen.liquidar)}

        </h2>



        <span>

          Total pendiente por liquidar

        </span>


      </div>







      <div

        style={{

          display:"grid",

          gridTemplateColumns:"1fr 1fr",

          gap:"14px",

          marginBottom:"30px",

        }}

      >


        <Resumen

          icon={<Users size={20}/>}

          titulo="Clientes"

          valor={resumen.clientes}

        />



        <Resumen

          icon={<Shirt size={20}/>}

          titulo="Artículos"

          valor={resumen.articulos}

        />


      </div>






      <h2

        style={{

          fontSize:"22px",

          fontWeight:"800",

          marginBottom:"16px",

        }}

      >

        Clientes por liquidar ({clientes.length})

      </h2>







      {

        clientes.map(cliente=>{


          const calculo = calcularCliente(cliente);



          return (

          <div

            key={cliente.id}

            style={{

              background:"#FFF0F3",

              borderRadius:"30px",

              padding:"24px",

              marginBottom:"18px",

            }}

          >



            <h3

              style={{

                margin:"0 0 8px",

                fontSize:"24px",

              }}

            >

              {cliente.nombre}

            </h3>





            <p

              style={{

                margin:"0 0 30px",

                color:"#8B8B99",

              }}

            >

              {cliente.articulos} artículo(s) vendido · Comisión Cherry Club {cliente.porcentaje}%

            </p>






            <Fila

              titulo="Total vendido"

              valor={`S/. ${formato(calculo.total)}`}

            />





            <Fila

              titulo="Comisión Cherry Club"

              valor={`- S/. ${formato(calculo.comisionCherry)}`}

            />







            <div

              style={{

                height:"1px",

                background:"#FFD6DF",

                margin:"22px 0",

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


              <span

                style={{

                  fontSize:"20px",

                  fontWeight:"800",

                }}

              >

                Monto a entregar

              </span>



              <strong

                style={{

                  fontSize:"28px",

                  color:"#16A34A",

                }}

              >

                S/. {formato(calculo.montoCliente)}

              </strong>



            </div>






            <button

              onClick={()=>setClienteLiquidar(cliente)}

              style={{

                width:"100%",

                height:"62px",

                border:"none",

                borderRadius:"22px",

                background:"#22A879",

                color:"#FFFFFF",

                fontWeight:"800",

                fontSize:"18px",

              }}

            >

              Marcar como liquidado

            </button>




          </div>

          )

        })

      }









      {

        clienteLiquidar && (


          <>

          <div

            style={{

              position:"fixed",

              inset:0,

              background:"rgba(0,0,0,.35)",

              zIndex:100,

            }}

            onClick={()=>setClienteLiquidar(null)}

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

              padding:"28px",

              zIndex:101,

            }}

          >



          <button

            onClick={()=>setClienteLiquidar(null)}

            style={{

              position:"absolute",

              right:"20px",

              top:"20px",

              border:"none",

              borderRadius:"50%",

              width:"38px",

              height:"38px",

            }}

          >

            <X size={20}/>

          </button>



          <h2>

            Confirmar liquidación

          </h2>



          <p>

            Vas a entregar a <strong>{clienteLiquidar.nombre}</strong>

          </p>




          <div

            style={{

              background:"#FFF0F3",

              borderRadius:"22px",

              padding:"20px",

              textAlign:"center",

              margin:"20px 0",

            }}

          >

            <strong

              style={{

                fontSize:"32px",

                color:"#16A34A",

              }}

            >

              S/. {formato(calcularCliente(clienteLiquidar).montoCliente)}

            </strong>


          </div>





          <button

            onClick={confirmarLiquidacion}

            style={{

              width:"100%",

              height:"60px",

              border:"none",

              borderRadius:"22px",

              background:"#C0003B",

              color:"#FFFFFF",

              fontWeight:"800",

              fontSize:"18px",

            }}

          >

            Confirmar liquidación

          </button>



          </div>


          </>

        )

      }







      {!clienteLiquidar && (

        <BottomNav

          onHome={onHome}

          onArticulos={onArticulos}

          onClientes={onClientes}

          onAgregar={onAgregar}

          onLiquidaciones={()=>{}}
          onGastos={onGastos}

        />

      )}



    </div>

  );


}







function Resumen({

  icon,

  titulo,

  valor,

}){

return (

<div

style={{

background:"#FFFFFF",

borderRadius:"22px",

padding:"18px",

display:"flex",

alignItems:"center",

gap:"10px",

}}

>

{icon}

<div>

<span>

{titulo}

</span>


<strong>

{valor}

</strong>

</div>


</div>

);

}





function Fila({

titulo,

valor,

}){


return (

<div

style={{

display:"flex",

justifyContent:"space-between",

marginBottom:"18px",

fontSize:"18px",

}}

>

<span>

{titulo}

</span>


<strong>

{valor}

</strong>


</div>

);


}
