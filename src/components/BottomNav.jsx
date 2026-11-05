import { BarChart3, Home, Plus, ReceiptText, Shirt, Users, Wallet } from "lucide-react";

const buttonStyle = {
  width:"48px", height:"48px", border:"none", background:"transparent", color:"#8B8B99",
  display:"flex", justifyContent:"center", alignItems:"center", cursor:"pointer",
};

export default function BottomNav({ onHome, onArticulos, onAgregar, onClientes, onLiquidaciones, onGastos, onEstadisticas }) {
  return <nav aria-label="Navegación principal" style={{
    position:"fixed", left:"50%", bottom:"18px", transform:"translateX(-50%)", width:"calc(100% - 32px)",
    maxWidth:"430px", height:"78px", background:"#FFFFFF", borderRadius:"28px", display:"grid",
    gridTemplateColumns:"repeat(7, minmax(0, 1fr))", justifyItems:"center", alignItems:"center",
    boxShadow:"0 12px 40px rgba(0,0,0,.12)", zIndex:999, padding:"0 8px",
  }}>
    <button onClick={onHome} aria-label="Inicio" style={buttonStyle}><Home size={24} strokeWidth={2.2}/></button>
    <button onClick={onArticulos} aria-label="Artículos" style={buttonStyle}><Shirt size={24} strokeWidth={2.2}/></button>
    <button onClick={onClientes} aria-label="Clientes" style={buttonStyle}><Users size={24} strokeWidth={2.2}/></button>
    <button onClick={onAgregar} aria-label="Agregar" title="Agregar" style={{
      ...buttonStyle, width:"60px", height:"60px", borderRadius:"50%", background:"#8B1E2D", color:"#FFFFFF",
      transform:"translateY(-18px)", gridColumn:"4", gridRow:"1", boxShadow:"0 12px 30px rgba(124,92,252,.35)",
    }}><Plus size={28} strokeWidth={2.5}/></button>
    <button onClick={onLiquidaciones} aria-label="Liquidaciones" style={buttonStyle}><Wallet size={24} strokeWidth={2.2}/></button>
    <button onClick={onGastos} aria-label="Gastos compartidos" title="Gastos" style={buttonStyle}><ReceiptText size={23} strokeWidth={2.2}/></button>
    <button onClick={onEstadisticas} aria-label="Estadísticas" title="Estadísticas" style={buttonStyle}><BarChart3 size={23} strokeWidth={2.2}/></button>
  </nav>;
}
