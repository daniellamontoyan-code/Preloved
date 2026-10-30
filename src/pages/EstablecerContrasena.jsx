import { useState } from "react";
import { supabase } from "../lib/supabase";
import BrandLockup from "../components/BrandLockup";

export default function EstablecerContrasena({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  async function guardar(event) {
    event.preventDefault();
    if (password.length < 8) return alert("La contraseña debe tener al menos 8 caracteres.");
    if (password !== confirmation) return alert("Las contraseñas no coinciden.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      alert("No se pudo guardar la contraseña. Abre el enlace más reciente e inténtalo otra vez.");
      return;
    }

    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    onDone();
  }

  return <div style={{ minHeight:"100vh", background:"#F5EBDD", display:"flex", justifyContent:"center", alignItems:"center", padding:32 }}>
    <form onSubmit={guardar} style={{ width:"100%", maxWidth:380, textAlign:"center" }}>
      <BrandLockup />
      <p style={{ fontSize:21, fontWeight:700, color:"#383B3B", marginBottom:24 }}>Crea tu contraseña</p>
      <input type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Nueva contraseña" style={fieldStyle}/>
      <input type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Repite la contraseña" style={{ ...fieldStyle, marginBottom:20 }}/>
      <button type="submit" disabled={loading} style={{ width:"100%", height:58, border:0, borderRadius:20, background:"#8B1E2D", color:"white", fontSize:19, fontWeight:700 }}>{loading ? "Guardando…" : "Guardar y entrar"}</button>
      <p style={{ color:"#777", fontSize:13, lineHeight:1.5, marginTop:18 }}>Usa al menos 8 caracteres. No compartas tu contraseña.</p>
    </form>
  </div>;
}

const fieldStyle = { width:"100%", height:58, borderRadius:20, border:"1px solid #E5E7EB", padding:"0 20px", fontSize:17, marginBottom:15, boxSizing:"border-box", background:"white" };
