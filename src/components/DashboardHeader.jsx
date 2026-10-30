import { LogOut } from "lucide-react";

export default function DashboardHeader({ nombre, onLogout }) {
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : "U";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "14px",
            color: "#8B8B99",
            margin: 0,
            marginBottom: "6px",
            fontWeight: "500",
          }}
        >
          Bienvenida de nuevo ✨
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            fontWeight: "700",
            color: "#383B3B",
          }}
        >
          {nombre}
        </h1>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div
        style={{
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          background: "#FFC9E3",
          color: "#8B1E2D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "700",
          fontSize: "22px",
        }}
      >
        {inicial}
      </div>
      <button onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión" style={{ width:42, height:42, borderRadius:"50%", border:"none", background:"#FFC9E3", color:"#8B1E2D", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <LogOut size={19}/>
      </button>
      </div>
    </div>
  );
}
