import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, ChevronLeft, Clock3, RefreshCw, Shirt, Store, Users, Wallet } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { getArticles } from "../lib/articles";
import { getClients } from "../lib/clients";
import { commissionShares } from "../lib/commission";
import { getExpenses } from "../lib/gastos";

const money = value => `S/ ${Number(value || 0).toFixed(2)}`;
const localDay = value => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const today = () => localDay(new Date());
const salePrice = article => Number(article.precio_venta || 0);
const saleDate = article => {
  const value = article.fecha_venta;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const hasSaleTime = article => typeof article.fecha_venta === "string" && /[T ]\d{2}:\d{2}/.test(article.fecha_venta);
const channelName = article => {
  const value = String(article.canal_venta || "").toLowerCase();
  if (value.includes("web")) return "Web";
  if (value.includes("feria")) return "Feria";
  return "Sin canal";
};

export default function Estadisticas({ articulos = [], nombreUsuario, onRefresh, onBack, onHome, onArticulos, onClientes, onLiquidaciones, onGastos, onAgregar, onEstadisticas }) {
  const [rango, setRango] = useState("30");
  const [diaSeleccionado, setDiaSeleccionado] = useState(today);
  const [articulosActualizados, setArticulosActualizados] = useState(articulos);
  const [clientes, setClientes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [actualizando, setActualizando] = useState(false);

  async function actualizar() {
    setActualizando(true);
    const [items, customers, expenses] = await Promise.all([getArticles(), getClients(), getExpenses()]);
    setArticulosActualizados(items);
    setClientes(customers);
    setGastos(expenses);
    await onRefresh?.();
    setActualizando(false);
  }

  useEffect(() => {
    actualizar();
    window.addEventListener("focus", actualizar);
    return () => window.removeEventListener("focus", actualizar);
  // Initial load only; focus refresh is managed by this page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapaClientes = useMemo(() => new Map(clientes.map(cliente => [String(cliente.id), cliente])), [clientes]);
  const metricas = useMemo(() => {
    const now = new Date();
    const days = ["all", "day"].includes(rango) ? null : Number(rango);
    const cutoff = days ? new Date(now.getTime() - days * 86400000) : null;
    const sold = articulosActualizados.filter(item => ["vendido", "liquidado"].includes(String(item.estado || "").trim().toLowerCase()));
    const periodSales = sold.filter(item => {
      if (rango === "day") return localDay(saleDate(item)) === diaSeleccionado;
      if (!cutoff) return true;
      const date = saleDate(item);
      return date && date >= cutoff;
    });
    const selectedSales = periodSales;
    const revenue = periodSales.reduce((sum, item) => sum + salePrice(item), 0);
    // Shared clients split Pitucas commission 50/50; personal clients belong
    // entirely to the signed-in member.
    const salesByClient = new Map();
    for (const item of periodSales) {
      const clientId = String(item.cliente || "");
      const client = mapaClientes.get(clientId);
      if (!clientId || !client) continue;
      const entry = salesByClient.get(clientId) || { total:0, percentage:Number(client.porcentaje_comision || 0), shared:client.compartido === true };
      entry.total += salePrice(item);
      salesByClient.set(clientId, entry);
    }
    const personalCommission = [...salesByClient.values()].reduce((sum, entry) => {
      const commission = entry.total * (entry.percentage / 100);
      const shares = commissionShares(commission, entry.shared, nombreUsuario);
      return sum + (nombreUsuario?.toLowerCase().includes("mafer") ? shares.mafer : shares.dani);
    }, 0);
    const selectedSalesByClient = new Map();
    for (const item of selectedSales) {
      const clientId = String(item.cliente || "");
      const client = mapaClientes.get(clientId);
      if (!clientId || !client) continue;
      const entry = selectedSalesByClient.get(clientId) || { total:0, percentage:Number(client.porcentaje_comision || 0), shared:client.compartido === true };
      entry.total += salePrice(item);
      selectedSalesByClient.set(clientId, entry);
    }
    const dayCommission = [...selectedSalesByClient.values()].reduce((sum, entry) => {
      const commission = entry.total * (entry.percentage / 100);
      const shares = commissionShares(commission, entry.shared, nombreUsuario);
      return sum + (nombreUsuario?.toLowerCase().includes("mafer") ? shares.mafer : shares.dani);
    }, 0);
    const dayClientShare = selectedSales.reduce((sum, item) => {
      const client = mapaClientes.get(String(item.cliente || ""));
      if (!client) return sum;
      const clientCommission = salePrice(item) * Number(client.porcentaje_comision || 0) / 100;
      return sum + Math.max(0, salePrice(item) - clientCommission);
    }, 0);
    const currentMember = nombreUsuario?.toLowerCase().includes("mafer") ? "mafer" : "dani";
    const dayExpenses = gastos.filter(expense => expense.fecha === diaSeleccionado);
    const sharedDayExpenses = dayExpenses.filter(expense => expense.compartido);
    const sharedDayExpenseTotal = sharedDayExpenses.reduce((sum, expense) => sum + Number(expense.monto || 0), 0);
    const sharedDayExpenseShare = sharedDayExpenseTotal / 2;
    const personalDayExpenseShare = dayExpenses
      .filter(expense => !expense.compartido && String(expense.pagado_por_nombre || "").trim().toLowerCase() === currentMember)
      .reduce((sum, expense) => sum + Number(expense.monto || 0), 0);
    const dayExpenseShare = sharedDayExpenseShare + personalDayExpenseShare;
    const dayGrossSales = selectedSales.reduce((sum, item) => sum + salePrice(item), 0);
    const dayBusinessCommission = Math.max(0, dayGrossSales - dayClientShare);
    const availableNow = articulosActualizados.filter(item => String(item.estado || "").trim().toLowerCase() === "disponible").length;
    const soldAllTime = sold.length;
    const byChannel = ["Feria", "Web", "Sin canal"].map(name => {
      const items = periodSales.filter(item => channelName(item) === name);
      return { name, count:items.length, revenue:items.reduce((sum, item) => sum + salePrice(item), 0) };
    });
    const categoryMap = new Map();
    const subcategoryMap = new Map();
    for (const item of periodSales) {
      const name = item.categoria || "Sin categoría";
      const entry = categoryMap.get(name) || { name, count:0, revenue:0 };
      entry.count += 1;
      entry.revenue += salePrice(item);
      categoryMap.set(name, entry);

      const subcategory = item.subcategoria || "Sin subcategoría";
      const subEntry = subcategoryMap.get(subcategory) || { name:subcategory, count:0, revenue:0 };
      subEntry.count += 1;
      subEntry.revenue += salePrice(item);
      subcategoryMap.set(subcategory, subEntry);
    }
    const categories = [...categoryMap.values()].sort((a, b) => b.count - a.count || b.revenue - a.revenue);
    const subcategories = [...subcategoryMap.values()].sort((a, b) => b.count - a.count || b.revenue - a.revenue);
    const hourCounts = Array(24).fill(0);
    for (const item of periodSales) {
      const date = saleDate(item);
      if (date && hasSaleTime(item)) hourCounts[date.getHours()] += 1;
    }
    const peakHour = Math.max(...hourCounts);
    const peakHours = peakHour ? hourCounts.map((count, hour) => ({ hour, count })).filter(item => item.count === peakHour) : [];
    const sharedClientSales = periodSales.filter(item => mapaClientes.get(String(item.cliente))?.compartido === true);
    return { sold:periodSales, revenue, personalCommission, byChannel, categories, subcategories, peakHours, sharedClientSales, dayCommission, dayClientShare, dayExpenseShare, sharedDayExpenseTotal, sharedDayExpenseShare, personalDayExpenseShare, dayGrossSales, dayBusinessCommission, dayNet:dayCommission - dayExpenseShare, daySaleCount:selectedSales.length, availableNow, soldAllTime, inventoryCount:articulosActualizados.length };
  }, [articulosActualizados, clientes, gastos, mapaClientes, nombreUsuario, rango, diaSeleccionado]);

  const topCategory = metricas.categories[0];
  const average = metricas.sold.length ? metricas.revenue / metricas.sold.length : 0;
  const peakLabel = metricas.peakHours.length
    ? metricas.peakHours.map(({ hour }) => `${String(hour).padStart(2, "0")}:00`).join(" · ")
    : "Sin horas registradas";
  const sellerName = nombreUsuario?.toLowerCase().includes("mafer") ? "Mafer" : "Dani";

  return <main className="app-page" style={{ minHeight:"100vh", background:"#F5EBDD", padding:"54px 18px 125px", maxWidth:470, margin:"0 auto", color:"#383B3B" }}>
    <header style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
      <button onClick={onBack} aria-label="Volver" style={iconButton}><ChevronLeft size={22}/></button>
      <div style={{ flex:1 }}><h1 style={{ margin:0, fontSize:27 }}>Estadísticas</h1><div style={{ color:"#777783", fontSize:13, marginTop:3 }}>Tus ventas, {sellerName}</div></div>
      <button onClick={actualizar} disabled={actualizando} aria-label="Actualizar estadísticas" style={iconButton}><RefreshCw size={18}/></button>
    </header>

    <div style={{ display:"flex", gap:8, marginBottom:17 }}>
      {[{ id:"day", label:"Día" }, { id:"7", label:"7 días" }, { id:"30", label:"30 días" }, { id:"all", label:"Todo" }].map(option => <button key={option.id} onClick={() => setRango(option.id)} style={{ border:0, borderRadius:999, padding:"10px 15px", background:rango === option.id ? "#8B1E2D" : "#FFFFFF", color:rango === option.id ? "#FFFFFF" : "#594137", fontWeight:750 }}>{option.label}</button>)}
    </div>

    {rango === "day" && <label style={{ ...card, display:"flex", alignItems:"center", gap:10, marginBottom:13, color:"#8B1E2D", fontWeight:750 }}><CalendarDays size={19}/> Elige el día<input aria-label="Día del análisis" type="date" value={diaSeleccionado} onChange={event => setDiaSeleccionado(event.target.value)} style={{ marginLeft:"auto", minWidth:0, border:"1px solid #EAD5DA", borderRadius:11, padding:"9px 10px", color:"#594137", background:"#FFF" }}/></label>}

    <section style={{ ...card, display:"grid", gridTemplateColumns:"repeat(3, minmax(0, 1fr))", gap:8 }}>
      {[{ label:"Registradas", value:metricas.inventoryCount }, { label:"Vendidas", value:metricas.soldAllTime }, { label:"Disponibles", value:metricas.availableNow }].map(item => <div key={item.label} style={{ textAlign:"center", padding:"4px 2px" }}><strong style={{ display:"block", color:"#8B1E2D", fontSize:22 }}>{item.value}</strong><span style={{ color:"#777783", fontSize:11 }}>{item.label}</span></div>)}
    </section>

    {rango === "day" && <section style={{ ...card, border:"1px solid #FF6B9E", background:"#FFF5F8" }}>
      <h2 style={sectionHeading}>Tu ganancia neta, paso a paso</h2>
      <p style={{ ...subValue, marginBottom:12 }}>En simple: primero se aparta la parte de quienes dejaron prendas. Lo que queda es la comisión de Pitucas; si el cliente es compartido, esa comisión se reparte entre Dani y Mafer. Después descontamos tu parte de los gastos de ese día.</p>
      <div style={analysisRow}><span>Ventas del día (referencia)</span><strong>{money(metricas.dayGrossSales)}</strong></div>
      <div style={analysisRow}><span>Parte de quienes dejaron prendas</span><strong>− {money(metricas.dayClientShare)}</strong></div>
      <div style={analysisRow}><span>Comisión total de Pitucas</span><strong>{money(metricas.dayBusinessCommission)}</strong></div>
      <div style={analysisRow}><span>Tu comisión, después del reparto</span><strong>{money(metricas.dayCommission)}</strong></div>
      <div style={analysisRow}><span>Gastos compartidos (total)</span><strong>{money(metricas.sharedDayExpenseTotal)}</strong></div>
      <div style={analysisRow}><span>Tu 50% de gastos compartidos</span><strong>− {money(metricas.sharedDayExpenseShare)}</strong></div>
      <div style={analysisRow}><span>Gastos individuales pagados por ti</span><strong>− {money(metricas.personalDayExpenseShare)}</strong></div>
      <div style={{ ...analysisRow, fontWeight:800 }}><span>Total de gastos descontados de tu parte</span><strong>− {money(metricas.dayExpenseShare)}</strong></div>
      <div style={{ ...analysisRow, marginTop:4, paddingTop:12, borderTop:"2px solid #F3D3E0", color:"#8B1E2D", fontSize:17 }}><strong>Te quedó neto</strong><strong>{money(metricas.dayNet)}</strong></div>
      <p style={{ ...subValue, marginBottom:0 }}>Las liquidaciones a quienes dejaron prendas son su parte de la venta: no se vuelven a restar aquí porque ya está separada arriba. Los gastos compartidos, como el stand, se cuentan mitad para cada una.</p>
      <div style={{ display:"flex", gap:10, marginTop:13, flexWrap:"wrap" }}>
        <span style={smallBadge}>{metricas.daySaleCount} prenda{metricas.daySaleCount === 1 ? "" : "s"} vendida{metricas.daySaleCount === 1 ? "" : "s"} ese día</span>
      </div>
    </section>}

    <section style={{ background:"#8B1E2D", color:"white", borderRadius:22, padding:20, marginBottom:13 }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, opacity:.9, fontWeight:700 }}><Wallet size={18}/> Ventas registradas</div>
      <strong style={{ display:"block", fontSize:31, marginTop:8 }}>{money(metricas.revenue)}</strong>
      <div style={{ marginTop:3, opacity:.9 }}>{metricas.sold.length} prenda{metricas.sold.length === 1 ? "" : "s"} vendida{metricas.sold.length === 1 ? "" : "s"} · Promedio {money(average)}</div>
    </section>

    <section style={{ ...card, border:"1px solid #FF6B9E", background:"#FFF5F8" }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, color:"#8B1E2D", fontWeight:750 }}><Wallet size={18}/> Tu comisión de Pitucas</div>
      <strong style={{ display:"block", color:"#8B1E2D", fontSize:28, marginTop:8 }}>{money(metricas.personalCommission)}</strong>
      <div style={subValue}>Clientes personales: comisión completa para ti. Clientes compartidos: reparto 50/50. No incluye gastos del negocio.</div>
    </section>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:13 }}>
      <article style={card}><div style={label}><Store size={17}/> Canal principal</div><strong style={bigValue}>{metricas.byChannel.slice().sort((a,b)=>b.count-a.count)[0]?.count ? metricas.byChannel.slice().sort((a,b)=>b.count-a.count)[0].name : "—"}</strong><div style={subValue}>{metricas.byChannel.find(item => item.count)?.count || 0} ventas</div></article>
      <article style={card}><div style={label}><Clock3 size={17}/> Hora pico</div><strong style={{ ...bigValue, fontSize:20 }}>{peakLabel}</strong><div style={subValue}>{metricas.peakHours[0]?.count || 0} ventas en esa hora</div></article>
    </div>

    <section style={card}>
      <h2 style={sectionHeading}>Ventas por canal</h2>
      {metricas.byChannel.map(item => <div key={item.name} style={{ marginTop:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:8, fontSize:14 }}><strong>{item.name}</strong><span>{item.count} · {money(item.revenue)}</span></div>
        <div style={{ height:9, borderRadius:99, background:"#F5EBDD", marginTop:7, overflow:"hidden" }}><div style={{ height:"100%", width:`${metricas.revenue ? Math.max(3, item.revenue / metricas.revenue * 100) : 0}%`, background:item.name === "Feria" ? "#FF6B9E" : item.name === "Web" ? "#8B1E2D" : "#A8AF99", borderRadius:99 }}/></div>
      </div>)}
    </section>

    <section style={card}>
      <h2 style={sectionHeading}><Shirt size={19}/> Lo más vendido por categoría</h2>
      {metricas.categories.length ? metricas.categories.slice(0, 6).map((item, index) => <div key={item.name} style={rowStyle}>
        <span style={{ width:27, height:27, flexShrink:0, display:"grid", placeItems:"center", borderRadius:9, background:index === 0 ? "#FFC9E3" : "#F5EBDD", color:"#8B1E2D", fontWeight:800 }}>{index + 1}</span>
        <strong style={{ flex:1 }}>{item.name}</strong><span style={{ color:"#777783", fontSize:13 }}>{item.count} · {money(item.revenue)}</span>
      </div>) : <div style={emptyText}>Todavía no hay ventas en este periodo.</div>}
      {topCategory && <p style={{ margin:"14px 0 0", color:"#777783", fontSize:12 }}>La categoría con más unidades vendidas es <strong style={{ color:"#8B1E2D" }}>{topCategory.name}</strong>.</p>}
    </section>

    <section style={card}>
      <h2 style={sectionHeading}><Shirt size={19}/> Lo más vendido por subcategoría</h2>
      {metricas.subcategories.length ? metricas.subcategories.slice(0, 6).map((item, index) => <div key={item.name} style={rowStyle}>
        <span style={{ width:27, height:27, flexShrink:0, display:"grid", placeItems:"center", borderRadius:9, background:index === 0 ? "#FFC9E3" : "#F5EBDD", color:"#8B1E2D", fontWeight:800 }}>{index + 1}</span>
        <strong style={{ flex:1 }}>{item.name}</strong><span style={{ color:"#777783", fontSize:13 }}>{item.count} · {money(item.revenue)}</span>
      </div>) : <div style={emptyText}>Todavía no hay ventas en este periodo.</div>}
    </section>

    <section style={{ ...card, marginBottom:12 }}>
      <h2 style={sectionHeading}><Users size={19}/> Clientes compartidos</h2>
      <strong style={{ fontSize:23, color:"#8B1E2D" }}>{metricas.sharedClientSales.length} venta{metricas.sharedClientSales.length === 1 ? "" : "s"}</strong>
      <div style={subValue}>Solo incluye tus ventas a clientes marcados como compartidos; los artículos de la otra cuenta no aparecen aquí.</div>
    </section>

    <div style={{ display:"flex", alignItems:"flex-start", gap:9, color:"#777783", fontSize:12, lineHeight:1.45, padding:"0 3px" }}><BarChart3 size={16} style={{ flexShrink:0 }}/> Las horas pico se calculan cuando la venta tiene hora registrada. Si solo guardaste la fecha, no se cuenta para ese indicador.</div>

    <BottomNav onHome={onHome} onArticulos={onArticulos} onAgregar={onAgregar} onClientes={onClientes} onLiquidaciones={onLiquidaciones} onGastos={onGastos} onEstadisticas={onEstadisticas}/>
  </main>;
}

const card = { background:"#FFFFFF", borderRadius:20, padding:17, marginBottom:13, boxShadow:"0 8px 24px rgba(0,0,0,.045)" };
const label = { display:"flex", alignItems:"center", gap:7, color:"#777783", fontSize:12, fontWeight:750 };
const bigValue = { display:"block", color:"#8B1E2D", fontSize:23, marginTop:10 };
const subValue = { marginTop:5, color:"#777783", fontSize:12, lineHeight:1.4 };
const sectionHeading = { margin:"0 0 8px", display:"flex", alignItems:"center", gap:8, color:"#383B3B", fontSize:16 };
const rowStyle = { display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid #F3E8E1", fontSize:14 };
const analysisRow = { display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, padding:"7px 0", color:"#594137", fontSize:13 };
const smallBadge = { display:"inline-flex", padding:"7px 10px", borderRadius:999, color:"#8B1E2D", background:"#FFC9E3", fontSize:11, fontWeight:750 };
const emptyText = { padding:"17px 0 4px", textAlign:"center", color:"#777783", fontSize:13 };
const iconButton = { width:42, height:42, display:"grid", placeItems:"center", border:0, borderRadius:"50%", background:"#FFFFFF", color:"#8B1E2D", cursor:"pointer" };
