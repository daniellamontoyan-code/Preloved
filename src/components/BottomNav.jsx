import {
  Home,
  Shirt,
  Plus,
  Users,
  Wallet,
} from "lucide-react";


export default function BottomNav({

  onHome,

  onArticulos,

  onAgregar,

  onClientes,
  
  onLiquidaciones,

}) {


  return (

    <div
      style={{
        position:"fixed",
        left:"50%",
        bottom:"18px",
        transform:"translateX(-50%)",
        width:"calc(100% - 32px)",
        maxWidth:"390px",
        height:"78px",
        background:"#FFFFFF",
        borderRadius:"28px",
        display:"flex",
        justifyContent:"space-around",
        alignItems:"center",
        boxShadow:"0 12px 40px rgba(0,0,0,.12)",
        zIndex:999,
        padding:"0 12px",
      }}
    >



      <button

        onClick={onHome}

        style={buttonStyle}

      >

        <Home size={24} strokeWidth={2.2}/>

      </button>






      <button

        onClick={onArticulos}

        style={buttonStyle}

      >

        <Shirt size={24} strokeWidth={2.2}/>

      </button>







      <button

        onClick={onAgregar}

        style={{
          width:"60px",
          height:"60px",
          borderRadius:"50%",
          border:"none",
          background:"#C0003B",
          color:"#FFFFFF",
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          cursor:"pointer",
          transform:"translateY(-18px)",
          boxShadow:"0 12px 30px rgba(124,92,252,.35)",
        }}

      >

        <Plus size={28} strokeWidth={2.5}/>


      </button>








      <button

        onClick={onClientes}

        style={buttonStyle}

      >

        <Users size={24} strokeWidth={2.2}/>

      </button>







      <button

  onClick={()=>{

    if(onLiquidaciones){

      onLiquidaciones();

    }

  }}

  style={buttonStyle}

>

  <Wallet size={24} strokeWidth={2.2} />

</button>





    </div>

  );

}



const buttonStyle = {

  width:"48px",

  height:"48px",

  border:"none",

  background:"transparent",

  color:"#8B8B99",

  display:"flex",

  justifyContent:"center",

  alignItems:"center",

  cursor:"pointer",

};