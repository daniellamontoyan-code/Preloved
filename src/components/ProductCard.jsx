export default function ProductCard({ articulo, onClick }) {


  function abrirDetalle(){

    if(onClick){

      onClick(articulo);

    }

  }



  return (

    <button

      onClick={abrirDetalle}

      style={{

        width:"100%",

        background:"#FFFFFF",

        border:"none",

        borderRadius:"22px",

        padding:"14px",

        display:"flex",

        alignItems:"center",

        gap:"12px",

        boxShadow:"0 10px 30px rgba(0,0,0,.05)",

        cursor:"pointer",

        textAlign:"left",

      }}

    >





      {
        articulo.foto ? (

          <img

            src={articulo.foto}

            alt={articulo.descripcion}

            style={{

              width:"58px",

              height:"58px",

              borderRadius:"16px",

              objectFit:"cover",

              flexShrink:0,

            }}

          />

        ) : (


          <div

            style={{

              width:"58px",

              height:"58px",

              borderRadius:"16px",

              background:"#F8F6FF",

              flexShrink:0,

            }}

          />


        )

      }







      <div

        style={{

          flex:1,

          minWidth:0,

        }}

      >



        <p

          style={{

            margin:0,

            fontSize:"16px",

            fontWeight:"700",

            color:"#1F1F28",

            whiteSpace:"nowrap",

            overflow:"hidden",

            textOverflow:"ellipsis",

          }}

        >

          {articulo.descripcion}


        </p>





        {
          articulo.categoria && (

            <span

              style={{

                display:"block",

                marginTop:"4px",

                fontSize:"13px",

                color:"#8B8B99",

              }}

            >

              {articulo.categoria}

            </span>

          )

        }



      </div>







      <strong

        style={{

          color:"#7C5CFC",

          fontSize:"16px",

          fontWeight:"800",

          whiteSpace:"nowrap",

        }}

      >

        S/. {articulo.precio || articulo.precio_venta || 0}


      </strong>






    </button>

  );

}