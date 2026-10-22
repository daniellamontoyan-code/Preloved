import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Inicio({ onDemo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState(false);

  async function ingresar(event) {
    event.preventDefault();
    if (!email.trim() || !password) return alert("Completa tu correo y contraseña.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) alert("No se pudo iniciar sesión. Revisa el correo y la contraseña.");
    setLoading(false);
  }

  async function recuperarContrasena() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return alert("Escribe tu correo para enviarte el enlace.");
    setLoading(true);
    setRecoveryMessage("");
    setRecoveryError(false);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) {
      setRecoveryError(true);
      setRecoveryMessage(
        error.status === 429 || /rate limit|too many requests/i.test(error.message || "")
          ? "Supabase alcanzó el límite de correos de autenticación. No se envió el enlace; espera una hora desde el último envío e inténtalo una sola vez."
          : "No se pudo enviar el enlace. Revisa tu correo e inténtalo más tarde.",
      );
      return;
    }
    setRecoveryMessage("Si el correo está registrado, recibirás un enlace para crear tu contraseña.");
  }

  return <div style={{ minHeight:"100vh", background:"#FAFAFC", display:"flex", justifyContent:"center", alignItems:"center", padding:32 }}>
    <form onSubmit={ingresar} style={{ width:"100%", maxWidth:380, textAlign:"center" }}>
      <h1 style={{ fontSize:64, fontWeight:800, background:"linear-gradient(90deg,#9D001E,#C0003B,#F43F5E)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:"0 0 8px" }}>Cherry Club</h1>
      <p style={{ fontSize:22, fontWeight:700, color:"#1F2937", marginBottom:32 }}>Tu espacio para organizar<br/>todo lo que vendes ✨</p>
      <input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="Correo" style={fieldStyle}/>
      <input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Contraseña" style={{ ...fieldStyle, marginBottom:20 }}/>
      <button type="submit" disabled={loading} style={{ width:"100%", height:58, border:0, borderRadius:20, background:"#C0003B", color:"white", fontSize:19, fontWeight:700 }}>{loading ? "Ingresando…" : "Ingresar"}</button>
      {import.meta.env.DEV && <button type="button" onClick={onDemo} style={{ width:"100%", height:54, marginTop:12, border:"1px solid #C0003B", borderRadius:20, background:"white", color:"#A00031", fontSize:16, fontWeight:750 }}>Ver vista de prueba</button>}
      <button type="button" onClick={recuperarContrasena} disabled={loading} style={{ display:"block", margin:"16px auto 0", border:0, background:"transparent", color:"#A00031", fontSize:14, fontWeight:700, textDecoration:"underline" }}>Olvidé mi contraseña</button>
      {recoveryMessage && <p role="status" style={{ color:recoveryError ? "#B42318" : "#177245", fontSize:13, lineHeight:1.5, marginTop:12 }}>{recoveryMessage}</p>}
      <p style={{ color:"#777", fontSize:13, lineHeight:1.5, marginTop:18 }}>Usa el correo y la contraseña configurados para tu cuenta Cherry Club.</p>
    </form>
  </div>;
}

const fieldStyle = { width:"100%", height:58, borderRadius:20, border:"1px solid #E5E7EB", padding:"0 20px", fontSize:17, marginBottom:15, boxSizing:"border-box", background:"white" };
