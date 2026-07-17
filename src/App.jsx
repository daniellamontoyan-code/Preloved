import Inicio from "./pages/Inicio";
import Dashboard from "./pages/Dashboard";

function App() {
  const usuario = localStorage.getItem("usuario");

  if (!usuario) {
    return <Inicio />;
  }

  return <Dashboard />;
}

export default App;