import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

import ProductCard from "../components/ProductCard";
import DetalleArticulo from "./DetalleArticulo";
import BottomNav from "../components/BottomNav";
import AddArticleSheet from "../components/AddArticleSheet";

import { getArticles } from "../lib/articles";



export default function Articulos({ 

  categoria, 
  onBack,
  onHome,
  onArticulos,
  onClientes,
  onLiquidaciones,

}) {


  const [articulos, setArticulos] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [filtro, setFiltro] = useState("Todos");

  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  const [showAddArticle, setShowAddArticle] = useState(false);







  useEffect(()=>{

    cargarArticulos();

  },[categoria]);







  async function cargarArticulos(){


    const data = await getArticles();



    let lista = data;



    if(categoria){

      lista = lista.filter(

        item => item.categoria === categoria

      );

    }




    lista.sort((a,b)=>

      a.descripcion.localeCompare(

        b.descripcion

      )

    );



    setArticulos(lista);


  }







  let filtrados = articulos.filter(item =>

    item.descripcion

      .toLowerCase()

      .includes(

        busqueda.toLowerCase()

      )

  );





  if(filtro === "Disponibles"){


    filtrados = filtrados.filter(

      item => item.estado === "Disponible"

    );


  }





  if(filtro === "Vendidos"){


    filtrados = filtrados.filter(

      item => item.estado === "Vendido"

    );


  }









  if(articuloSeleccionado){


    return (

      <DetalleArticulo

        articulo={articuloSeleccionado}

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

          marginBottom:"20px",

        }}

      >


        {

          [

            "Todos",

            "Disponibles",

            "Vendidos"

          ].map((item)=>(


            <button

              key={item}

              onClick={()=>setFiltro(item)}

              style={{

                flex:1,

                height:"40px",

                borderRadius:"20px",

                border:"none",

                background:

                  filtro === item

                  ? "#7C5CFC"

                  : "#FFFFFF",

                color:

                  filtro === item

                  ? "#FFFFFF"

                  : "#7B7B88",

                fontWeight:"600",

                fontSize:"14px",

              }}

            >

              {item}

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





    </div>

  );

}