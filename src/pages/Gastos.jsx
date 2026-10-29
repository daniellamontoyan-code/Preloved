import { useCallback, useEffect, useState } from "react";
import { Camera, ChevronLeft, ImagePlus, ReceiptText, X } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { createExpense, getExpenseMembers, getExpenses } from "../lib/gastos";
import { getCurrentUserId } from "../lib/supabase";

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

export default function Gastos({ onBack, onHome, onArticulos, onClientes, onLiquidaciones, onGastos }) {
  const [gastos, setGastos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(today());
  const [compartido, setCompartido] = useState(false);
  const [miembros, setMiembros] = useState([]);
  const [pagadoPor, setPagadoPor] = useState("");
  const [usuarioActual, setUsuarioActual] = useState("");
  const [evidencia, setEvidencia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [evidenciaAbierta, setEvidenciaAbierta] = useState(null);
  const [loading, setLoading] = useState(false);

  const cargarGastos = useCallback(async () => {
    const data = await getExpenses();
    setGastos(data);
  }, []);

  useEffect(() => {
    cargarGastos();
    Promise.all([getExpenseMembers(), getCurrentUserId()]).then(([equipo, currentId]) => {
      setMiembros(equipo);
      setUsuarioActual(currentId || "");
      setPagadoPor(currentId || equipo[0]?.id || "");
    });
    const actualizar = () => cargarGastos();
    window.addEventListener("focus", actualizar);
    return () => window.removeEventListener("focus", actualizar);
  }, [cargarGastos]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  function elegirEvidencia(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setEvidencia(file);
    setPreview(URL.createObjectURL(file));
  }

  function cerrarFormulario() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setShowForm(false);
    setDescripcion("");
    setMonto("");
    setFecha(today());
    setCompartido(false);
    setPagadoPor(usuarioActual || miembros[0]?.id || "");
    setEvidencia(null);
    setPreview(null);
  }

  async function guardarGasto() {
    if (!descripcion.trim()) return alert("Escribe para qué fue el gasto.");
    if (!Number(monto) || Number(monto) <= 0) return alert("Ingresa un monto válido.");
    if (!pagadoPor) return alert("Selecciona quién pagó o asumió el gasto.");
    setLoading(true);
    const gasto = await createExpense({ descripcion, monto, fecha, evidencia, compartido, pagado_por: pagadoPor });
    setLoading(false);
    if (!gasto) return alert(evidencia ? "No se pudo guardar el gasto o subir la evidencia. Revisa tu conexión e inténtalo otra vez." : "No se pudo guardar el gasto. Revisa tu conexión e inténtalo otra vez.");
    cerrarFormulario();
    await cargarGastos();
  }

  const total = gastos.reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0);
  const formato = value => Number(value || 0).toFixed(2);
  const dani = miembros.find(persona => persona.nombre.trim().toLowerCase() === "dani");
  const mafer = miembros.find(persona => persona.nombre.trim().toLowerCase() === "mafer");
  const pagadoDani = gastos.reduce((sum, gasto) => sum + (gasto.compartido && (gasto.pagado_por || gasto.owner_id) === dani?.id ? Number(gasto.monto || 0) : 0), 0);
  const pagadoMafer = gastos.reduce((sum, gasto) => sum + (gasto.compartido && (gasto.pagado_por || gasto.owner_id) === mafer?.id ? Number(gasto.monto || 0) : 0), 0);
  const saldo = (pagadoDani - pagadoMafer) / 2;

  return <div style={{ minHeight:"100vh", background:"#FAFAFC", padding:"60px 20px 125px", maxWidth:430, margin:"0 auto" }}>
    <header style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
      <button onClick={onBack} aria-label="Volver" style={iconButton}><ChevronLeft size={22}/></button>
      <div style={{ flex:1 }}>
        <h1 style={{ margin:0, color:"#1F1F28", fontSize:27 }}>Gastos</h1>
        <div style={{ marginTop:3, color:"#777783", fontSize:13 }}>Visible para Dani y Mafer</div>
      </div>
      <ReceiptText size={25} color="#C0003B"/>
    </header>

    <div style={{ background:"linear-gradient(135deg,#9D001E,#C0003B)", color:"white", borderRadius:22, padding:19, marginBottom:20 }}>
      <div style={{ fontSize:13, opacity:.85, fontWeight:700 }}>Total registrado</div>
      <strong style={{ display:"block", marginTop:5, fontSize:27 }}>S/ {formato(total)}</strong>
      <div style={{ marginTop:3, fontSize:12, opacity:.85 }}>{gastos.length} gasto{gastos.length === 1 ? "" : "s"} registrado{gastos.length === 1 ? "" : "s"}</div>
    </div>

    <div style={{ background:"white", borderRadius:20, padding:17, marginBottom:18, boxShadow:"0 8px 24px rgba(0,0,0,.045)" }}>
      <div style={{ color:"#777783", fontSize:13, fontWeight:750 }}>Saldo de gastos compartidos (mitad para cada una)</div>
      {!dani || !mafer
        ? <strong style={{ display:"block", marginTop:8, color:"#777783", fontSize:15 }}>No se pudo cargar el saldo entre ambas.</strong>
        : Math.abs(saldo) < 0.005
          ? <strong style={{ display:"block", marginTop:8, color:"#28733B", fontSize:17 }}>Están al día entre ustedes</strong>
          : <strong style={{ display:"block", marginTop:8, color:"#9D001E", fontSize:17 }}>{saldo > 0 ? "Mafer le debe a Dani" : "Dani le debe a Mafer"} S/ {formato(Math.abs(saldo))}</strong>}
      <div style={{ marginTop:5, color:"#777783", fontSize:12 }}>Solo cuenta gastos marcados como compartidos y quién los pagó.</div>
    </div>

    <button onClick={() => setShowForm(true)} style={{ width:"100%", height:54, border:0, borderRadius:17, background:"#FFF0F3", color:"#9D001E", fontSize:16, fontWeight:800, marginBottom:18 }}>+ Registrar gasto</button>

    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {gastos.length ? gastos.map(gasto => <article key={gasto.id} style={{ background:"white", borderRadius:19, padding:16, boxShadow:"0 8px 24px rgba(0,0,0,.045)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start" }}>
          <div style={{ minWidth:0 }}>
            <strong style={{ display:"block", color:"#272731", fontSize:15, overflowWrap:"anywhere" }}>{gasto.descripcion}</strong>
            <div style={{ marginTop:5, color:"#777783", fontSize:12 }}>{new Date(`${gasto.fecha}T12:00:00`).toLocaleDateString("es-PE")} · {gasto.registrado_por}</div>
            <div style={{ marginTop:5, color:gasto.compartido ? "#9D001E" : "#777783", fontSize:12, fontWeight:750 }}>{gasto.compartido ? `Compartido 50/50 · Lo pagó ${gasto.pagado_por_nombre}` : `Gasto personal · Lo asumió ${gasto.pagado_por_nombre}`}</div>
          </div>
          <strong style={{ whiteSpace:"nowrap", color:"#C0003B", fontSize:17 }}>S/ {formato(gasto.monto)}</strong>
        </div>
        {gasto.evidencia_url && <button onClick={() => setEvidenciaAbierta(gasto.evidencia_url)} style={{ display:"flex", alignItems:"center", gap:10, border:0, padding:0, marginTop:13, background:"transparent", color:"#7B1730", fontWeight:750 }}>
          <img src={gasto.evidencia_url} alt="Evidencia del gasto" style={{ width:54, height:54, borderRadius:12, objectFit:"cover" }}/>
          Ver evidencia
        </button>}
      </article>) : <div style={{ padding:"28px 18px", textAlign:"center", background:"white", borderRadius:20, color:"#777783" }}>Aún no hay gastos compartidos. Registra el primero con el botón de arriba.</div>}
    </div>

    <BottomNav onHome={onHome || onBack} onArticulos={onArticulos} onAgregar={() => setShowForm(true)} onClientes={onClientes} onLiquidaciones={onLiquidaciones} onGastos={onGastos}/>

    {showForm && <>
      <div onClick={cerrarFormulario} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.36)", zIndex:1100 }}/>
      <section role="dialog" aria-modal="true" aria-labelledby="expense-title" style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, maxHeight:"90dvh", overflowY:"auto", background:"white", borderRadius:"28px 28px 0 0", padding:"22px 20px calc(28px + env(safe-area-inset-bottom))", zIndex:1101 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h2 id="expense-title" style={{ margin:0, fontSize:23 }}>Registrar gasto</h2>
          <button onClick={cerrarFormulario} aria-label="Cerrar" style={iconButton}><X size={20}/></button>
        </div>
        <label style={labelStyle}>¿En qué se gastó?</label>
        <input autoFocus value={descripcion} onChange={event => setDescripcion(event.target.value)} placeholder="Ej. Bolsas para empaque" style={inputStyle}/>
        <label style={labelStyle}>Monto</label>
        <input type="number" inputMode="decimal" min="0.01" step="0.01" value={monto} onChange={event => setMonto(event.target.value)} placeholder="S/ 0.00" style={inputStyle}/>
        <label style={labelStyle}>Fecha</label>
        <input type="date" value={fecha} onChange={event => setFecha(event.target.value)} style={inputStyle}/>
        <label style={labelStyle}>¿Quién pagó o asumió el gasto?</label>
        <select value={pagadoPor} onChange={event => setPagadoPor(event.target.value)} style={inputStyle}>
          <option value="" disabled>Selecciona una persona</option>
          {miembros.map(persona => <option key={persona.id} value={persona.id}>{persona.nombre}</option>)}
        </select>
        <label style={{ display:"flex", alignItems:"flex-start", gap:11, margin:"15px 0 7px", color:"#42424D", fontSize:14, lineHeight:1.4, fontWeight:750 }}>
          <input type="checkbox" checked={compartido} onChange={event => setCompartido(event.target.checked)} style={{ width:19, height:19, accentColor:"#C0003B", flexShrink:0, marginTop:1 }}/>
          <span>Este gasto se comparte entre Dani y Mafer</span>
        </label>
        {compartido && <div style={{ margin:"0 0 8px 30px", color:"#777783", fontSize:12 }}>Se dividirá 50/50 para calcular el saldo entre ustedes.</div>}
        <label style={labelStyle}>Foto de evidencia (opcional)</label>
        <input id="expense-camera" type="file" accept="image/*" capture="environment" onChange={elegirEvidencia} style={{ display:"none" }}/>
        <input id="expense-gallery" type="file" accept="image/*" onChange={elegirEvidencia} style={{ display:"none" }}/>
        {preview && <img src={preview} alt="Vista previa de la evidencia" style={{ display:"block", width:"100%", maxHeight:180, objectFit:"contain", background:"#FAFAFC", borderRadius:15, marginBottom:10 }}/>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:18 }}>
          <button type="button" onClick={() => document.getElementById("expense-camera")?.click()} style={photoButton}><Camera size={17}/> Tomar foto</button>
          <button type="button" onClick={() => document.getElementById("expense-gallery")?.click()} style={photoButton}><ImagePlus size={17}/> Galería</button>
        </div>
        <button onClick={guardarGasto} disabled={loading} style={saveButton}>{loading ? "Guardando…" : "Guardar gasto"}</button>
      </section>
    </>}

    {evidenciaAbierta && <div onClick={() => setEvidenciaAbierta(null)} style={{ position:"fixed", inset:0, zIndex:1200, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"center", justifyContent:"center", padding:18 }}>
      <button onClick={() => setEvidenciaAbierta(null)} aria-label="Cerrar evidencia" style={{ ...iconButton, position:"absolute", right:16, top:22, background:"white" }}><X size={20}/></button>
      <img onClick={event => event.stopPropagation()} src={evidenciaAbierta} alt="Evidencia del gasto ampliada" style={{ maxWidth:"100%", maxHeight:"85vh", objectFit:"contain", borderRadius:12 }}/>
    </div>}
  </div>;
}

const iconButton = { width:42, height:42, flexShrink:0, border:0, borderRadius:"50%", display:"grid", placeItems:"center", background:"#F3F3F7", color:"#272731" };
const labelStyle = { display:"block", margin:"13px 0 7px", color:"#565662", fontSize:13, fontWeight:750 };
const inputStyle = { width:"100%", boxSizing:"border-box", height:50, borderRadius:14, border:"1px solid #E3E3E8", padding:"0 13px", fontSize:16, background:"white" };
const photoButton = { height:46, border:0, borderRadius:14, background:"#FFF0F3", color:"#9D001E", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:7 };
const saveButton = { width:"100%", height:54, border:0, borderRadius:16, background:"#C0003B", color:"white", fontWeight:850, fontSize:16 };
