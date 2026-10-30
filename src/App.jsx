import { useEffect, useState } from "react";
import Inicio from "./pages/Inicio";
import Dashboard from "./pages/Dashboard";
import EstablecerContrasena from "./pages/EstablecerContrasena";
import VistaDemo from "./pages/VistaDemo";
import CatalogoPublico from "./pages/CatalogoPublico";
import { supabase } from "./lib/supabase";

const authLinkType = new URLSearchParams(window.location.hash.slice(1)).get("type");

function App() {
  const [session, setSession] = useState(undefined);
  const [demoMode, setDemoMode] = useState(false);
  const [passwordFlow, setPasswordFlow] = useState(
    authLinkType === "invite" || authLinkType === "recovery",
  );

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession || null);
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && authLinkType === "invite")) {
        setPasswordFlow(true);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (window.location.pathname.replace(/\/+$/, "") === "/catalogo") {
    return <CatalogoPublico />;
  }

  if (session === undefined) return <div style={{ padding:40, textAlign:"center" }}>Abriendo Pitucas Pero Misias…</div>;
  if (demoMode) return <VistaDemo onExit={() => setDemoMode(false)} />;
  if (!session) return <Inicio onDemo={() => setDemoMode(true)} />;
  if (passwordFlow) return <EstablecerContrasena onDone={() => setPasswordFlow(false)} />;
  return <Dashboard user={session.user} />;
}

export default App;
