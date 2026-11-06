import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ("serviceWorker" in navigator) {
  let refreshingForWorkerUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingForWorkerUpdate) return;
    refreshingForWorkerUpdate = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache:"none" })
      .then(registration => registration.update())
      .catch(() => {});
  });
}
