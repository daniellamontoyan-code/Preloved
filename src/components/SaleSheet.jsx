import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { confirmSale } from "../lib/articles";

const metodos = ["Yape", "Plin", "Efectivo", "Transferencia"];

export default function SaleSheet({ articulo, paymentQrSrc, onClose, onSold, modoFeria = false }) {
  const canalInicial = modoFeria || articulo.publicar_feria !== false ? "Feria" : "Web";
  const [canalVenta, setCanalVenta] = useState(canalInicial);
  const precioInicial = canalInicial === "Web" ? articulo.precio_web ?? articulo.precio : articulo.precio;
  const [precioVenta, setPrecioVenta] = useState(String(precioInicial || ""));
  const [metodoPago, setMetodoPago] = useState("");
  const [recibido, setRecibido] = useState("");
  const [loading, setLoading] = useState(false);
  const vuelto = useMemo(() => Math.max(0, Number(recibido || 0) - Number(precioVenta || 0)), [recibido, precioVenta]);

  async function guardarVenta() {
    if (!metodoPago) return alert("Elige cómo te pagaron.");
    if (!Number(precioVenta) || Number(precioVenta) <= 0) return alert("Ingresa un precio válido.");
    setLoading(true);
    const actualizado = await confirmSale({ id: articulo.id, precio_venta: Number(precioVenta), canal_venta: canalVenta, metodo_pago: metodoPago });
    if (actualizado) {
      onSold(actualizado);
      if (actualizado.pendiente_sync) alert("Venta guardada en este teléfono. Se sincronizará cuando vuelva el internet.");
      onClose();
    } else if (!navigator.onLine) {
      alert("No se pudo guardar la venta en este momento. Mantén esta pantalla abierta e inténtalo otra vez.");
    }
    setLoading(false);
  }

  return <>
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:1200 }} />
    <div role="dialog" aria-modal="true" aria-labelledby="sale-sheet-title" style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, height:"min(90dvh, 820px)", display:"flex", flexDirection:"column", overflow:"hidden", background:"white", borderRadius:"28px 28px 0 0", zIndex:1201 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px 12px", flexShrink:0 }}>
        <h2 id="sale-sheet-title" style={{ margin:0, fontSize:23 }}>Cobrar venta</h2>
        <button onClick={onClose} aria-label="Cerrar" style={closeStyle}><X size={20}/></button>
      </div>
      <div style={{ overflowY:"auto", minHeight:0, padding:"0 20px 18px", WebkitOverflowScrolling:"touch", overscrollBehavior:"contain" }}>
      <div style={{ background:"#FFC9E3", borderRadius:16, padding:14, marginBottom:14, fontWeight:650 }}>{articulo.descripcion}</div>
      {modoFeria ? (
        <div style={channelNotice}>Modo feria · se registra con el canal y precio de feria.</div>
      ) : <>
        <label style={labelStyle}>¿Dónde se vendió?</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
          {["Feria", "Web"].map(canal => {
            const precioCanal = canal === "Web" ? articulo.precio_web ?? articulo.precio : articulo.precio;
            const selected = canalVenta === canal;
            return <button key={canal} onClick={() => { setCanalVenta(canal); setPrecioVenta(String(precioCanal || "")); }} style={{ ...channelStyle, background:selected ? "#8B1E2D" : "#FFC9E3", color:selected ? "white" : "#8B1E2D" }}>
              {canal}<small style={{ display:"block", marginTop:3, opacity:.85 }}>S/ {Number(precioCanal || 0).toFixed(2)}</small>
            </button>;
          })}
        </div>
      </>}
      <label style={labelStyle}>{modoFeria ? "Precio de feria cobrado" : `Precio cobrado · ${canalVenta}`}</label>
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {[Number(canalVenta === "Web" ? articulo.precio_web ?? articulo.precio : articulo.precio || 0), 5, 10].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v) => <button key={v} onClick={() => setPrecioVenta(String(v))} style={chipStyle}>S/ {v}</button>)}
      </div>
      <input type="number" inputMode="decimal" value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} style={inputStyle} placeholder="Monto en soles" />
      <label style={labelStyle}>¿Cómo te pagaron?</label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
        {metodos.map(m => <button key={m} onClick={() => setMetodoPago(m)} style={{ ...methodStyle, background: metodoPago === m ? "#8B1E2D" : "#FFC9E3", color: metodoPago === m ? "white" : "#8B1E2D" }}>{m}</button>)}
      </div>
      {metodoPago === "Efectivo" && <>
        <label style={labelStyle}>Efectivo recibido (opcional)</label>
        <input type="number" inputMode="decimal" value={recibido} onChange={e => setRecibido(e.target.value)} style={inputStyle} placeholder="Ej. 50" />
        {Number(recibido) >= Number(precioVenta) && <p style={{ margin:"-3px 0 14px", fontWeight:700, color:"#177245" }}>Vuelto: S/ {vuelto.toFixed(2)}</p>}
      </>}
      {metodoPago === "Yape" && paymentQrSrc && <div style={{ textAlign:"center", marginBottom:16 }}>
        <p style={{ margin:"0 0 9px", fontSize:14, fontWeight:700 }}>Escanea para pagar por Yape</p>
        <img src={paymentQrSrc} alt="QR de Yape de Daniella Montoya" style={{ display:"block", width:"min(100%, 270px)", aspectRatio:"1 / 1", objectFit:"contain", margin:"0 auto", borderRadius:14, border:"1px solid #EEE" }} />
        <p style={{ margin:"8px 0 0", fontSize:12, color:"#686875" }}>Confirma el pago recibido antes de registrar la venta.</p>
      </div>}
      {metodoPago === "Yape" && !paymentQrSrc && <div style={{ background:"#F8F8FA", borderRadius:14, padding:12, marginBottom:14, color:"#686875", fontSize:13 }}>Esta cuenta aún no tiene un QR de Yape configurado. Confirma el pago manualmente.</div>}
      {metodoPago === "Plin" && <div style={{ background:"#F8F8FA", borderRadius:14, padding:12, marginBottom:14, color:"#686875", fontSize:13 }}>Confirma el pago recibido por Plin antes de registrar la venta.</div>}
      </div>
      <div style={{ flexShrink:0, padding:"12px 20px calc(14px + env(safe-area-inset-bottom))", background:"white", borderTop:"1px solid #F1F1F3" }}>
        <button onClick={guardarVenta} disabled={loading} style={submitStyle}>{loading ? "Guardando…" : "Confirmar venta"}</button>
      </div>
    </div>
  </>;
}

const labelStyle = { display:"block", fontSize:13, fontWeight:700, color:"#585865", margin:"10px 0 8px" };
const inputStyle = { width:"100%", height:52, borderRadius:15, border:"1px solid #E5E7EB", padding:"0 14px", fontSize:18, marginBottom:12 };
const chipStyle = { border:0, borderRadius:20, padding:"8px 13px", background:"#F5F5F7", color:"#555", fontWeight:700 };
const methodStyle = { border:0, borderRadius:15, height:48, fontSize:15, fontWeight:700 };
const channelStyle = { border:0, borderRadius:15, minHeight:58, padding:"8px 10px", fontSize:15, fontWeight:800 };
const channelNotice = { borderRadius:13, padding:"12px 14px", marginBottom:14, background:"#FFC9E3", color:"#8B1E2D", fontSize:13, fontWeight:750 };
const closeStyle = { width:40, height:40, borderRadius:"50%", border:0, background:"#F5EBDD" };
const submitStyle = { width:"100%", height:56, border:0, borderRadius:17, background:"#8B1E2D", color:"white", fontSize:17, fontWeight:800 };
