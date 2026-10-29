export default function ProductCard({ articulo, onClick, onQuickSale, feria = false, canal = null }) {


  function abrirDetalle(){

    if(onClick){

      onClick(articulo);

    }

  }

  const feriaPrice = articulo.precio || articulo.precio_venta || 0;
  const estadoNormalizado = String(articulo.estado || "").trim().toLowerCase();
  const vendido = ["vendido", "liquidado"].includes(estadoNormalizado);
  const primaryChannel = canal || (feria || articulo.publicar_feria !== false ? "Feria" : "Web");
  const primaryPrice = vendido && articulo.precio_venta != null
    ? articulo.precio_venta
    : primaryChannel === "Web" ? articulo.precio_web || 0 : feriaPrice;
  const priceLabel = vendido ? "Vendido por" : primaryChannel;



  return (

    <div
      role="button"
      tabIndex={0}

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

      onKeyDown={(event) => { if (event.key === "Enter") abrirDetalle(); }}
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

              background:"#FFF0F3",

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





        { vendido && (
          <span
            style={{
              display: "inline-block",
              marginTop: "6px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: estadoNormalizado === "vendido" ? "#FFF3D6" : "#E8F5E9",
              color: estadoNormalizado === "vendido" ? "#8A5700" : "#28733B",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            {estadoNormalizado === "vendido" ? "VENDIDO · POR LIQUIDAR" : "LIQUIDADO"}
          </span>
        )}

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

              {[articulo.categoria, articulo.subcategoria, articulo.talla && `Talla ${articulo.talla}`].filter(Boolean).join(" · ")}

            </span>

          )

        }



      </div>







      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
      <strong

        style={{

          color:"#C0003B",

          fontSize:"16px",

          fontWeight:"800",

          whiteSpace:"nowrap",

        }}

      >

        {priceLabel}: S/. {primaryPrice}


      </strong>
      {!feria && canal !== "Web" && articulo.publicar_feria !== false && articulo.publicar_web !== false && Number(articulo.precio_web) !== Number(feriaPrice) && <span style={{ color:"#7B7B88", fontSize:12, fontWeight:700 }}>Web: S/. {articulo.precio_web || 0}</span>}
      </div>

      {feria && articulo.estado === "Disponible" && <button
        onClick={(event) => { event.stopPropagation(); onQuickSale?.(articulo); }}
        style={{ border:0, borderRadius:13, padding:"11px 13px", background:"#C0003B", color:"white", fontWeight:800, whiteSpace:"nowrap" }}
      >Vender</button>}






    </div>

  );

}
