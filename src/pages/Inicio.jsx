import { useState } from "react";
import { supabase } from "../lib/supabase";
import BrandLockup from "../components/BrandLockup";
import "./Inicio.css";

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

  return <main className="login-page">
    <form className="login-card" onSubmit={ingresar}>
      <BrandLockup />
      <p className="login-intro">Tu espacio para organizar<br/>todo lo que vendes.</p>
      <label className="login-label" htmlFor="login-email">Correo</label>
      <input id="login-email" className="login-field" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="Tu correo"/>
      <label className="login-label" htmlFor="login-password">Contraseña</label>
      <input id="login-password" className="login-field login-field-last" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Tu contraseña"/>
      <button className="login-submit" type="submit" disabled={loading}>{loading ? "Ingresando…" : "Ingresar"}</button>
      {import.meta.env.DEV && <button className="login-demo" type="button" onClick={onDemo}>Ver vista de prueba</button>}
      <button className="login-recovery" type="button" onClick={recuperarContrasena} disabled={loading}>Olvidé mi contraseña</button>
      {recoveryMessage && <p className={`login-message${recoveryError ? " is-error" : ""}`} role="status">{recoveryMessage}</p>}
      <p className="login-hint">Usa el correo y la contraseña configurados para tu cuenta.</p>
    </form>
  </main>;
}
