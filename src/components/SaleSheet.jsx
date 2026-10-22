import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { confirmSale } from "../lib/articles";

const metodos = ["Yape", "Plin", "Efectivo", "Transferencia"];

export default function SaleSheet({ articulo, paymentQrSrc, onClose, onSold }) {
  const [precioVenta, setPrecioVenta] = useState(String(articulo.precio || ""));
  const [metodoPago, setMetodoPago] = useState("");
  const [recibido, setRecibido] = useState("");
  const [loading, setLoading] = useState(false);
  const vuelto = useMemo(() => Math.max(0, Number(recibido || 0) - Number(precioVenta || 0)), [recibido, precioVenta]);

  async function guardarVenta() {
    if (!metodoPago) return alert("Elige cómo te pagaron.");
    if (!Number(precioVenta) || Number(precioVenta) <= 0) return alert("Ingresa un precio válido.");
    setLoading(true);
    const actualizado = await confirmSale({ id: articulo.id, precio_venta: Number(precioVenta), metodo_pago: metodoPago });
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
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:200 }} />
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, maxHeight:"90vh", overflowY:"auto", background:"white", borderRadius:"28px 28px 0 0", padding:"22px 20px 34px", zIndex:201 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h2 style={{ margin:0, fontSize:23 }}>Cobrar venta</h2>
        <button onClick={onClose} aria-label="Cerrar" style={closeStyle}><X size={20}/></button>
      </div>
      <div style={{ background:"#FFF0F3", borderRadius:16, padding:14, marginBottom:14, fontWeight:650 }}>{articulo.descripcion}</div>
      <label style={labelStyle}>Precio cobrado</label>
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {[Number(articulo.precio || 0), 5, 10].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v) => <button key={v} onClick={() => setPrecioVenta(String(v))} style={chipStyle}>S/ {v}</button>)}
      </div>
      <input type="number" inputMode="decimal" value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} style={inputStyle} placeholder="Monto en soles" />
      <label style={labelStyle}>¿Cómo te pagaron?</label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
        {metodos.map(m => <button key={m} onClick={() => setMetodoPago(m)} style={{ ...methodStyle, background: metodoPago === m ? "#C0003B" : "#FFF0F3", color: metodoPago === m ? "white" : "#7B1730" }}>{m}</button>)}
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
      <button onClick={guardarVenta} disabled={loading} style={submitStyle}>{loading ? "Guardando…" : "Confirmar venta"}</button>
    </div>
  </>;
}

const labelStyle = { display:"block", fontSize:13, fontWeight:700, color:"#585865", margin:"10px 0 8px" };
const inputStyle = { width:"100%", height:52, borderRadius:15, border:"1px solid #E5E7EB", padding:"0 14px", fontSize:18, marginBottom:12 };
const chipStyle = { border:0, borderRadius:20, padding:"8px 13px", background:"#F5F5F7", color:"#555", fontWeight:700 };
const methodStyle = { border:0, borderRadius:15, height:48, fontSize:15, fontWeight:700 };
const closeStyle = { width:40, height:40, borderRadius:"50%", border:0, background:"#F3F3F7" };
const submitStyle = { width:"100%", height:56, border:0, borderRadius:17, background:"#C0003B", color:"white", fontSize:17, fontWeight:800 };
