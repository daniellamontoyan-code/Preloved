import { useState } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";

import SaleSheet from "../components/SaleSheet";

import { deleteArticle } from "../lib/articles";



export default function DetalleArticulo({ articulo, onBack }) {


  const [showSale, setShowSale] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [articuloActual, setArticuloActual] = useState(articulo);



  const fecha = new Date(
    articuloActual.created_at
  ).toLocaleDateString("es-PE");




  const precioMostrar =

    articuloActual.precio

    ||

    articuloActual.precio_venta

    ||

    0;






  async function eliminarArticulo(){


    const eliminado = await deleteArticle(
      articuloActual.id
    );


    if(eliminado){

      setShowDeleteModal(false);

      onBack();

    }

  }






  return (

    <>

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
            justifyContent:"space-between",
            marginBottom:"24px",
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
              margin:0,
              fontSize:"26px",
              fontWeight:"700",
              color:"#1F1F28",
            }}
          >

            Detalle

          </h1>




          <button
            onClick={()=>setShowDeleteModal(true)}
            style={{
              width:"40px",
              height:"40px",
              borderRadius:"50%",
              border:"none",
              background:"#FEF2F2",
              color:"#DC2626",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
            }}
          >

            <Trash2 size={20}/>

          </button>


        </div>







        <div
          style={{
            width:"100%",
            height:"300px",
            borderRadius:"28px",
            overflow:"hidden",
            background:"#F8F6FF",
            marginBottom:"22px",
          }}
        >

          {
            articuloActual.foto ? (

              <img
                src={articuloActual.foto}
                alt={articuloActual.descripcion}
                style={{
                  width:"100%",
                  height:"100%",
                  objectFit:"cover",
                }}
              />

            ) : (

              <div
                style={{
                  height:"100%",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  color:"#7C5CFC",
                  fontWeight:"600",
                }}
              >

                Sin imagen

              </div>

            )

          }

        </div>







        <h2
          style={{
            margin:"0 0 20px",
            textAlign:"center",
            fontSize:"24px",
            fontWeight:"700",
            color:"#1F1F28",
          }}
        >

          {articuloActual.descripcion}

        </h2>







        <div
          style={{
            background:"#FFFFFF",
            borderRadius:"24px",
            padding:"20px",
            boxShadow:"0 10px 30px rgba(0,0,0,.05)",
            display:"flex",
            flexDirection:"column",
            gap:"18px",
            marginBottom:"24px",
          }}
        >


          <InfoRow

            titulo="Precio:"

            valor={`S/. ${precioMostrar}`}

          />




          <InfoRow

            titulo="Fecha de ingreso:"

            valor={fecha}

          />




          <InfoRow

            titulo="Código:"

            valor={articuloActual.codigo}

          />






          <div
            style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
            }}
          >


            <span
              style={{
                color:"#7B7B88",
                fontSize:"15px",
              }}
            >

              Estado:

            </span>




            <div
              style={{
                display:"flex",
                alignItems:"center",
                gap:"8px",
                padding:"8px 14px",
                borderRadius:"20px",
                background:
                  articuloActual.estado === "Vendido"
                  ? "#FEF2F2"
                  : "#ECFDF3",
                color:
                  articuloActual.estado === "Vendido"
                  ? "#DC2626"
                  : "#16A34A",
                fontWeight:"700",
                fontSize:"14px",
              }}
            >


              <span
                style={{
                  width:"9px",
                  height:"9px",
                  borderRadius:"50%",
                  background:
                    articuloActual.estado === "Vendido"
                    ? "#DC2626"
                    : "#22C55E",
                }}
              />


              {articuloActual.estado}


            </div>


          </div>



        </div>







        {
          articuloActual.estado !== "Vendido" && (

            <button
              onClick={()=>setShowSale(true)}
              style={{
                width:"100%",
                height:"60px",
                border:"none",
                borderRadius:"22px",
                background:"#7C5CFC",
                color:"#FFFFFF",
                fontSize:"18px",
                fontWeight:"700",
              }}
            >

              Confirmar venta

            </button>

          )
        }





      </div>








      {
        showSale && (

          <SaleSheet

            articulo={articuloActual}

            onClose={()=>setShowSale(false)}

            onSold={(actualizado)=>{

              setArticuloActual(actualizado);

            }}

          />

        )
      }









      {
        showDeleteModal && (

          <div
            style={{
              position:"fixed",
              inset:0,
              background:"rgba(0,0,0,.25)",
              backdropFilter:"blur(8px)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              zIndex:100,
              padding:"20px",
            }}
          >



            <div
              style={{
                width:"100%",
                maxWidth:"360px",
                background:"#FFFFFF",
                borderRadius:"28px",
                padding:"28px",
                textAlign:"center",
              }}
            >


              <div
                style={{
                  width:"60px",
                  height:"60px",
                  borderRadius:"50%",
                  background:"#FEF2F2",
                  color:"#DC2626",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  margin:"0 auto 18px",
                }}
              >

                <Trash2 size={28}/>

              </div>




              <h3
                style={{
                  margin:"0 0 10px",
                  fontSize:"22px",
                }}
              >

                ¿Eliminar artículo?

              </h3>




              <p
                style={{
                  margin:"0 0 24px",
                  color:"#7B7B88",
                }}
              >

                Esta acción no se puede deshacer.

              </p>




              <div
                style={{
                  display:"flex",
                  gap:"12px",
                }}
              >


                <button

                  onClick={()=>setShowDeleteModal(false)}

                  style={{
                    flex:1,
                    height:"50px",
                    border:"none",
                    borderRadius:"18px",
                    background:"#F3F3F7",
                  }}

                >

                  Cancelar

                </button>





                <button

                  onClick={eliminarArticulo}

                  style={{
                    flex:1,
                    height:"50px",
                    border:"none",
                    borderRadius:"18px",
                    background:"#DC2626",
                    color:"#FFFFFF",
                  }}

                >

                  Eliminar

                </button>


              </div>




            </div>



          </div>

        )

      }





    </>

  );

}







function InfoRow({titulo, valor}) {


  return (

    <div
      style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        gap:"20px",
      }}
    >

      <span
        style={{
          color:"#7B7B88",
          fontSize:"15px",
        }}
      >

        {titulo}

      </span>



      <strong
        style={{
          color:"#1F1F28",
          fontSize:"15px",
        }}
      >

        {valor}

      </strong>


    </div>

  );

}