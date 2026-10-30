import { ChevronRight } from "lucide-react";


export default function CategoryCard({ title, onClick }) {

  return (

    <button
      onClick={onClick}

      style={{
        width:"100%",
        background:"#FFFFFF",
        border:"none",
        borderRadius:"22px",
        padding:"22px",
        cursor:"pointer",
        boxShadow:"0 10px 30px rgba(0,0,0,.05)",
        transition:"all .2s ease",
        color:"#383B3B",
      }}


      onMouseDown={(e)=>{
        e.currentTarget.style.transform="scale(.98)";
      }}

      onMouseUp={(e)=>{
        e.currentTarget.style.transform="scale(1)";
      }}

      onMouseLeave={(e)=>{
        e.currentTarget.style.transform="scale(1)";
      }}

    >

      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
        }}
      >

        <span
          style={{
            fontSize:"17px",
            fontWeight:"600",
          }}
        >
          {title}
        </span>


        <ChevronRight
          size={20}
          color="#8B1E2D"
          strokeWidth={1.8}
        />


      </div>


    </button>

  );

}