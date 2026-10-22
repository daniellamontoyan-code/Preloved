import { useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Boxes, ChartNoAxesCombined, CircleDollarSign, House, Search, Shirt, Users, Wifi, X } from "lucide-react";

const initialItems = [
  { id: 1, name: "Blusa de lino", category: "Ropa", price: 45, emoji: "👚", color: "#FFE1E7", status: "Disponible" },
  { id: 2, name: "Zapatillas urbanas", category: "Calzado", price: 85, emoji: "👟", color: "#FFD6DF", status: "Disponible" },
  { id: 3, name: "Cartera pequeña", category: "Bolsos", price: 62, emoji: "👜", color: "#FFF0F3", status: "Disponible" },
  { id: 4, name: "Vestido floral", category: "Ropa", price: 70, emoji: "👗", color: "#FFE4E6", status: "Vendido" },
];

const demoClients = [
  { name: "Consignaciones Aurora", pieces: 8, commission: 20, color: "#FFE1E7" },
  { name: "Rincón de Moda", pieces: 5, commission: 15, color: "#FFD6DF" },
];

const tabs = [
  { id: "inicio", label: "Inicio", icon: House },
  { id: "articulos", label: "Prendas", icon: Shirt },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "resumen", label: "Resumen", icon: ChartNoAxesCombined },
];

export default function VistaDemo({ onExit }) {
  const [tab, setTab] = useState("inicio");
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todo");
  const [selectedItem, setSelectedItem] = useState(null);
  const [payment, setPayment] = useState("Yape");

  const visibleItems = useMemo(() => items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "Todo" || item.category === category;
    return matchesSearch && matchesCategory;
  }), [items, search, category]);

  function markAsSold() {
    setItems((current) => current.map((item) => item.id === selectedItem.id ? { ...item, status: "Vendido" } : item));
    setSelectedItem(null);
  }

  const available = items.filter((item) => item.status === "Disponible").length;
  const soldTotal = items.filter((item) => item.status === "Vendido").reduce((sum, item) => sum + item.price, 0);

  return <div style={styles.page}>
    <div style={styles.phone}>
      <div style={styles.demoBanner}>
        <span><BadgeCheck size={15}/> VISTA DE PRUEBA · No guarda cambios</span>
        <button onClick={onExit} aria-label="Volver al ingreso" style={styles.exitButton}><X size={17}/></button>
      </div>

      {tab === "inicio" && <main style={styles.main}>
        <header style={styles.header}>
          <div><div style={styles.eyebrow}>TU ESPACIO DE VENTA</div><h1 style={styles.brand}>Cherry Club</h1></div>
          <div style={styles.avatar}>D</div>
        </header>
        <section style={styles.welcome}><div><p style={styles.muted}>Hola, Dani 👋</p><h2>¿Lista para vender?</h2></div><div style={styles.network}><Wifi size={16}/> En línea</div></section>
        <section style={styles.statsGrid}>
          <Stat icon={<Boxes size={19}/>} label="Disponibles" value={available} tint="#FFF0F3"/>
          <Stat icon={<CircleDollarSign size={19}/>} label="Ventas del día" value={`S/ ${soldTotal}`} tint="#FFE1E7"/>
        </section>
        <section style={styles.section}>
          <div style={styles.sectionHeader}><h2>Lo más reciente</h2><button onClick={() => setTab("articulos")} style={styles.textButton}>Ver todo</button></div>
          {items.slice(0, 3).map((item) => <ItemRow key={item.id} item={item} onClick={() => item.status === "Disponible" && setSelectedItem(item)}/>) }
        </section>
        <section style={styles.feriaCard}>
          <div style={styles.feriaIcon}>🍒</div><div><strong>¿Estás en una feria?</strong><p>Encuentra una prenda y registra su venta en segundos.</p></div>
          <button onClick={() => setTab("articulos")} style={styles.feriaButton}>Abrir prendas</button>
        </section>
      </main>}

      {tab === "articulos" && <main style={styles.main}>
        <header style={styles.pageHeading}><div><div style={styles.eyebrow}>INVENTARIO</div><h1>Mis prendas</h1></div><span style={styles.countPill}>{available} disponibles</span></header>
        <label style={styles.searchBox}><Search size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar una prenda" style={styles.searchInput}/></label>
        <div style={styles.filters}>{["Todo", "Ropa", "Calzado", "Bolsos"].map((value) => <button key={value} onClick={() => setCategory(value)} style={{ ...styles.filter, ...(category === value ? styles.filterActive : {}) }}>{value}</button>)}</div>
        <div style={styles.itemList}>{visibleItems.map((item) => <ItemRow key={item.id} item={item} onClick={() => item.status === "Disponible" && setSelectedItem(item)}/>)}</div>
      </main>}

      {tab === "clientes" && <main style={styles.main}>
        <header style={styles.pageHeading}><div><div style={styles.eyebrow}>CONTACTOS</div><h1>Mis clientes</h1></div><span style={styles.countPill}>{demoClients.length} clientes</span></header>
        <p style={styles.intro}>Aquí puedes organizar las prendas que tienes en consignación.</p>
        {demoClients.map((client) => <article key={client.name} style={styles.clientCard}><div style={{ ...styles.clientAvatar, background: client.color }}>{client.name.slice(0, 1)}</div><div style={{ flex: 1 }}><h3>{client.name}</h3><p>{client.pieces} prendas · Comisión {client.commission}%</p></div><span style={styles.chevron}>›</span></article>)}
        <div style={styles.noteCard}>En tu cuenta real, cada persona verá solo los clientes que registre.</div>
      </main>}

      {tab === "resumen" && <main style={styles.main}>
        <header style={styles.pageHeading}><div><div style={styles.eyebrow}>TUS NÚMEROS</div><h1>Resumen</h1></div></header>
        <div style={styles.summaryCard}><span>Ventas registradas</span><strong>S/ {soldTotal.toFixed(2)}</strong><small>Este monto es solo de ejemplo</small></div>
        <div style={styles.summaryCard}><span>Prendas disponibles</span><strong>{available}</strong><small>Lista para vender</small></div>
        <div style={styles.summaryCard}><span>Clientes activos</span><strong>{demoClients.length}</strong><small>Información de demostración</small></div>
        <div style={styles.noteCard}>Las liquidaciones y los datos reales aparecen al iniciar sesión en Cherry Club.</div>
      </main>}

      <nav style={styles.bottomNav}>{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} style={{ ...styles.navButton, color: tab === id ? "#C0003B" : "#8B8B99" }}><Icon size={20}/><span>{label}</span></button>)}</nav>
    </div>

    {selectedItem && <div style={styles.overlay} onClick={() => setSelectedItem(null)}><section style={styles.sheet} onClick={(event) => event.stopPropagation()}>
      <button aria-label="Cerrar" onClick={() => setSelectedItem(null)} style={styles.close}><X size={20}/></button>
      <div style={{ ...styles.productArt, background: selectedItem.color }}>{selectedItem.emoji}</div>
      <h2 style={{ margin: "14px 0 5px" }}>{selectedItem.name}</h2><p style={styles.muted}>{selectedItem.category} · S/ {selectedItem.price.toFixed(2)}</p>
      <label style={styles.fieldLabel}>¿Cómo te pagaron?</label><div style={styles.paymentOptions}>{["Yape", "Plin", "Efectivo"].map((method) => <button key={method} onClick={() => setPayment(method)} style={{ ...styles.filter, ...(payment === method ? styles.filterActive : {}) }}>{method}</button>)}</div>
      {payment === "Yape" && <p style={styles.qrNote}>En la aplicación real se muestra el QR de la cuenta que inició sesión.</p>}
      <button onClick={markAsSold} style={styles.sellButton}>Registrar venta de prueba</button>
      <p style={styles.disclaimer}>Esta acción solo cambia los datos ficticios de esta demostración.</p>
    </section></div>}
  </div>;
}

function Stat({ icon, label, value, tint }) {
  return <article style={styles.statCard}><div style={{ ...styles.statIcon, background: tint }}>{icon}</div><span>{label}</span><strong>{value}</strong></article>;
}

function ItemRow({ item, onClick }) {
  return <article style={styles.itemRow}>
    <div style={{ ...styles.itemEmoji, background: item.color }}>{item.emoji}</div>
    <div style={styles.itemInfo}><strong>{item.name}</strong><span>{item.category} · S/ {item.price.toFixed(2)}</span><small style={{ color: item.status === "Disponible" ? "#177245" : "#A00031" }}>{item.status}</small></div>
    {item.status === "Disponible" && <button onClick={onClick} style={styles.sellMini}>Vender</button>}
  </article>;
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(150deg,#FFF7F8 0%,#FFE5EA 46%,#FAFAFC 100%)", padding: "20px 12px 36px", color: "#29212A", fontFamily: "Inter, system-ui, sans-serif" },
  phone: { width: "100%", maxWidth: 430, minHeight: "calc(100vh - 56px)", margin: "0 auto", background: "#FFFEFE", borderRadius: 30, overflow: "hidden", boxShadow: "0 18px 60px rgba(132,0,39,.13)", position: "relative", paddingBottom: 78 },
  demoBanner: { height: 38, padding: "0 14px", background: "#9D001E", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, fontWeight: 800, letterSpacing: ".045em" },
  exitButton: { background: "transparent", color: "white", border: 0, display: "grid", placeItems: "center", padding: 4 },
  main: { padding: "22px 20px 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  eyebrow: { color: "#B83A58", fontSize: 10, fontWeight: 850, letterSpacing: ".12em", marginBottom: 5 },
  brand: { fontSize: 30, lineHeight: 1, fontWeight: 900, letterSpacing: "-.055em", color: "#B00035" },
  avatar: { width: 42, height: 42, borderRadius: 16, display: "grid", placeItems: "center", fontWeight: 850, color: "#A00031", background: "#FFE1E7" },
  welcome: { display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 18 },
  muted: { color: "#79727A", margin: "0 0 4px", fontSize: 13 },
  network: { display: "flex", alignItems: "center", gap: 4, color: "#177245", fontSize: 11, fontWeight: 700, paddingBottom: 3 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 },
  statCard: { background: "white", border: "1px solid #F1E7EA", borderRadius: 19, padding: 15, display: "grid", gap: 8, boxShadow: "0 5px 16px rgba(61,17,31,.035)" },
  statIcon: { width: 34, height: 34, borderRadius: 12, color: "#B00035", display: "grid", placeItems: "center" },
  section: { marginTop: 25 },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 },
  textButton: { color: "#B00035", border: 0, background: "transparent", fontWeight: 750, fontSize: 12 },
  feriaCard: { marginTop: 19, background: "linear-gradient(125deg,#9D001E,#D41C4F)", color: "white", borderRadius: 21, padding: 16, display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", gap: 8 },
  feriaIcon: { fontSize: 25, gridRow: "span 2" },
  feriaButton: { gridColumn: "2", justifySelf: "start", border: 0, borderRadius: 12, background: "white", color: "#9D001E", fontWeight: 800, padding: "9px 13px", marginTop: 5 },
  pageHeading: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "3px 0 19px" },
  countPill: { color: "#A00031", fontWeight: 750, background: "#FFF0F3", borderRadius: 20, padding: "8px 10px", fontSize: 11 },
  searchBox: { height: 46, display: "flex", alignItems: "center", gap: 9, border: "1px solid #EEE3E6", borderRadius: 15, padding: "0 12px", color: "#8B7D83", marginBottom: 12 },
  searchInput: { outline: 0, border: 0, width: "100%", fontSize: 14, background: "transparent" },
  filters: { display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 12 },
  filter: { border: "1px solid #F0E0E4", background: "white", color: "#665A60", borderRadius: 20, padding: "8px 12px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" },
  filterActive: { borderColor: "#C0003B", background: "#C0003B", color: "white" },
  itemList: { display: "grid", gap: 9 },
  itemRow: { display: "flex", alignItems: "center", gap: 11, padding: 10, border: "1px solid #F0E8EA", borderRadius: 17, background: "white", minWidth: 0 },
  itemEmoji: { flexShrink: 0, width: 53, height: 53, borderRadius: 15, display: "grid", placeItems: "center", fontSize: 27 },
  itemInfo: { display: "grid", gap: 3, flex: 1, minWidth: 0, fontSize: 12 },
  sellMini: { border: 0, borderRadius: 12, padding: "9px 11px", background: "#C0003B", color: "white", fontSize: 11, fontWeight: 800 },
  bottomNav: { position: "absolute", bottom: 0, height: 69, width: "100%", display: "flex", justifyContent: "space-around", alignItems: "center", borderTop: "1px solid #F1E7EA", background: "rgba(255,255,255,.96)" },
  navButton: { width: "25%", height: 58, display: "grid", placeContent: "center", justifyItems: "center", gap: 4, border: 0, background: "transparent", fontSize: 10, fontWeight: 750 },
  intro: { color: "#79727A", fontSize: 13, lineHeight: 1.5, margin: "-5px 0 17px" },
  clientCard: { display: "flex", alignItems: "center", gap: 11, padding: 14, border: "1px solid #F0E8EA", borderRadius: 17, marginBottom: 10, background: "white" },
  clientAvatar: { width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", color: "#A00031", fontWeight: 850 },
  chevron: { color: "#C0003B", fontSize: 28 },
  noteCard: { background: "#FFF0F3", color: "#7D3A4B", borderRadius: 16, padding: 14, fontSize: 12, lineHeight: 1.5, marginTop: 15 },
  summaryCard: { display: "grid", gap: 7, border: "1px solid #F0E8EA", borderRadius: 18, padding: 16, marginBottom: 10, background: "white" },
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(25,10,15,.42)", display: "flex", alignItems: "end", justifyContent: "center", padding: 12 },
  sheet: { width: "100%", maxWidth: 430, borderRadius: "25px 25px 18px 18px", padding: 20, background: "white", position: "relative", boxShadow: "0 14px 45px rgba(0,0,0,.18)" },
  close: { position: "absolute", right: 16, top: 15, width: 34, height: 34, border: 0, borderRadius: "50%", background: "#FFF0F3", color: "#9D001E", display: "grid", placeItems: "center" },
  productArt: { height: 115, borderRadius: 18, display: "grid", placeItems: "center", fontSize: 58 },
  fieldLabel: { display: "block", margin: "20px 0 9px", fontSize: 12, fontWeight: 800 },
  paymentOptions: { display: "flex", gap: 8 },
  qrNote: { fontSize: 12, color: "#78676E", background: "#FFF0F3", padding: 12, borderRadius: 13, lineHeight: 1.45, margin: "12px 0 0" },
  sellButton: { width: "100%", height: 51, marginTop: 14, border: 0, borderRadius: 15, background: "#C0003B", color: "white", fontSize: 15, fontWeight: 800 },
  disclaimer: { color: "#8A7C82", textAlign: "center", fontSize: 10, margin: "9px 0 0" },
};
