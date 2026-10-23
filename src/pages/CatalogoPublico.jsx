import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, Minus, Plus, Search, Send, ShoppingBag, X } from "lucide-react";
import { getPublicCatalog } from "../lib/catalog";
import { signArticleImages } from "../lib/storage";
import "./CatalogoPublico.css";

const instagramUrl = "https://www.instagram.com/cherryclub.wav/";

export default function CatalogoPublico() {
  const [articles, setArticles] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todo");
  const [size, setSize] = useState("Todas");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [displayCount, setDisplayCount] = useState(24);

  useEffect(() => { loadCatalog(); }, []);

  async function loadCatalog() {
    setLoading(true);
    setLoadError(false);
    const result = await getPublicCatalog();
    setArticles(result.articles);
    setLoadError(Boolean(result.error));
    setLoading(false);
  }

  const categories = useMemo(() => [
    "Todo",
    ...new Set(articles.map(item => item.categoria).filter(Boolean)),
  ], [articles]);
  const sizes = useMemo(() => [...new Set(articles.map(item => item.talla).filter(Boolean))].sort(), [articles]);

  const visibleArticles = useMemo(() => articles.filter((item) => {
    const term = search.trim().toLocaleLowerCase("es");
    const matchesSearch = !term || [item.descripcion, item.codigo, item.categoria, item.subcategoria, item.talla]
      .filter(Boolean).some(value => String(value).toLocaleLowerCase("es").includes(term));
    const matchesCategory = category === "Todo" || item.categoria === category;
    const matchesSize = size === "Todas" || item.talla === size;
    return matchesSearch && matchesCategory && matchesSize;
  }), [articles, search, category, size]);
  const displayedArticles = useMemo(() => visibleArticles.slice(0, displayCount), [visibleArticles, displayCount]);

  useEffect(() => {
    const photosToSign = displayedArticles.filter(item => item.foto && !photoUrls[item.id]);
    if (!photosToSign.length) return;
    let active = true;
    signArticleImages(photosToSign).then((signed) => {
      if (!active) return;
      setPhotoUrls(current => {
        const next = { ...current };
        signed.forEach(item => {
          if (item.foto && (item.foto_path || /^https?:/i.test(item.foto))) next[item.id] = item.foto;
        });
        return next;
      });
    });
    return () => { active = false; };
  }, [displayedArticles, photoUrls]);

  function addToCart(article) {
    setCart(current => current.some(item => String(item.id) === String(article.id))
      ? current
      : [...current, article]);
    setCopied(false);
  }

  function removeFromCart(articleId) {
    setCart(current => current.filter(item => String(item.id) !== String(articleId)));
    setCopied(false);
  }

  const total = cart.reduce((sum, item) => sum + Number(item.precio || 0), 0);
  const inquiryMessage = [
    "Hola Cherry Club 🍒, quisiera consultar disponibilidad de:",
    ...cart.map(item => `• ${item.descripcion}${item.talla ? ` (talla ${item.talla})` : ""}${item.codigo ? ` · ${item.codigo}` : ""} — S/ ${Number(item.precio || 0).toFixed(2)}`),
    `Total referencial: S/ ${total.toFixed(2)}`,
  ].join("\n");

  async function consultOnInstagram() {
    setMessageText(inquiryMessage);
    const instagramWindow = window.open(instagramUrl, "_blank", "noopener,noreferrer");
    try {
      await navigator.clipboard.writeText(inquiryMessage);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    if (!instagramWindow) setCartOpen(true);
  }

  return (
    <main className="public-catalog">
      <header className="catalog-header">
        <a className="catalog-brand" href="/catalogo" aria-label="Cherry Club, inicio del catálogo">
          <span className="catalog-brand-mark">C</span>
          <span>Cherry Club<small>PRELOVED FINDS</small></span>
        </a>
        <button className="catalog-cart-icon" onClick={() => setCartOpen(true)} aria-label={`Abrir carrito, ${cart.length} productos`}>
          <ShoppingBag size={21}/>
          {cart.length > 0 && <span>{cart.length}</span>}
        </button>
      </header>

      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <p className="catalog-eyebrow">SEGUNDA VIDA, PRIMERA ELECCIÓN</p>
          <h1>Encuentra tu próximo favorito<span>🍒</span></h1>
          <p>Piezas únicas, elegidas para volver a ser parte de tu historia.</p>
          <a className="catalog-instagram-link" href={instagramUrl} target="_blank" rel="noreferrer">
            Síguenos en Instagram <ArrowUpRight size={16}/>
          </a>
        </div>
        <div className="catalog-hero-stamp" aria-hidden="true"><span>CHERRY</span><strong>♡</strong><span>CLUB</span></div>
      </section>

      <section className="catalog-section" aria-label="Catálogo de prendas">
        <div className="catalog-section-heading">
          <div><p className="catalog-eyebrow">DESCUBRE ALGO ESPECIAL</p><h2>El clóset</h2></div>
          <span className="catalog-count">{loading ? "Cargando…" : `${visibleArticles.length} piezas`}</span>
        </div>

        <div className="catalog-filters">
          <label className="catalog-search"><Search size={18}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Busca una prenda, talla o código"/></label>
          <label className="catalog-size-filter"><span>Talla</span><select value={size} onChange={event => setSize(event.target.value)}><option>Todas</option>{sizes.map(value => <option key={value}>{value}</option>)}</select></label>
        </div>

        <nav className="catalog-categories" aria-label="Filtrar por categoría">
          {categories.map(value => <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{value}</button>)}
        </nav>

        {loading ? (
          <div className="catalog-empty"><div className="catalog-loader"/><p>Estamos preparando las prendas…</p></div>
        ) : loadError ? (
          <div className="catalog-empty"><span>🍒</span><h3>El catálogo se está preparando</h3><p>Vuelve a intentarlo en un momento.</p><button onClick={loadCatalog}>Reintentar</button></div>
        ) : visibleArticles.length === 0 ? (
          <div className="catalog-empty"><span>♡</span><h3>{articles.length ? "No encontramos prendas con esos filtros" : "Pronto habrá nuevas piezas"}</h3><p>{articles.length ? "Prueba con otra categoría, talla o búsqueda." : "Estamos preparando el catálogo Cherry Club."}</p>{articles.length > 0 && <button onClick={() => { setSearch(""); setCategory("Todo"); setSize("Todas"); }}>Ver todas las prendas</button>}</div>
        ) : (
          <div className="catalog-grid">
            {displayedArticles.map(article => {
              const inCart = cart.some(item => String(item.id) === String(article.id));
              return (
                <article className="catalog-product" key={article.id}>
                  <div className="catalog-product-photo">
                    {photoUrls[article.id] ? <img src={photoUrls[article.id]} alt={article.descripcion} loading="lazy"/> : <div className="catalog-photo-placeholder">🍒</div>}
                    {article.talla && <span className="catalog-size-tag">Talla {article.talla}</span>}
                  </div>
                  <div className="catalog-product-info">
                    <p className="catalog-product-category">{[article.categoria, article.subcategoria].filter(Boolean).join(" · ") || "Pieza única"}</p>
                    <h3>{article.descripcion}</h3>
                    {article.codigo && <span className="catalog-product-code">{article.codigo}</span>}
                    <div className="catalog-product-bottom"><strong>S/ {Number(article.precio || 0).toFixed(2)}</strong><button className={inCart ? "added" : ""} onClick={() => inCart ? removeFromCart(article.id) : addToCart(article)} aria-label={inCart ? `Quitar ${article.descripcion} del carrito` : `Agregar ${article.descripcion} al carrito`}>{inCart ? <Check size={17}/> : <Plus size={18}/>}</button></div>
                  </div>
                </article>
              );
            })}
            {displayedArticles.length < visibleArticles.length && <button className="catalog-load-more" onClick={() => setDisplayCount(count => count + 24)}>Ver más prendas</button>}
          </div>
        )}
      </section>

      <footer className="catalog-footer"><span>Cherry Club 🍒</span><span>Una segunda vida para piezas especiales</span><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14}/></a></footer>

      {cartOpen && <div className="catalog-overlay" onClick={() => setCartOpen(false)}>
        <section className="catalog-cart-panel" role="dialog" aria-modal="true" aria-label="Tu selección" onClick={event => event.stopPropagation()}>
          <div className="catalog-cart-heading"><div><p className="catalog-eyebrow">TU SELECCIÓN</p><h2>Tu carrito <span>({cart.length})</span></h2></div><button className="catalog-close" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X size={21}/></button></div>
          {cart.length === 0 ? <div className="catalog-cart-empty"><ShoppingBag size={30}/><p>Agrega las prendas que te gusten y consúltalas por Instagram.</p><button onClick={() => setCartOpen(false)}>Seguir mirando</button></div> : <>
            <div className="catalog-cart-items">{cart.map(item => <article className="catalog-cart-item" key={item.id}>
              {photoUrls[item.id] ? <img src={photoUrls[item.id]} alt=""/> : <div className="catalog-cart-placeholder">🍒</div>}
              <div className="catalog-cart-item-copy"><strong>{item.descripcion}</strong><span>{[item.talla && `Talla ${item.talla}`, item.codigo].filter(Boolean).join(" · ")}</span><b>S/ {Number(item.precio || 0).toFixed(2)}</b></div>
              <button className="catalog-remove" onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.descripcion}`}><Minus size={15}/></button>
            </article>)}</div>
            <div className="catalog-cart-total"><span>Total referencial</span><strong>S/ {total.toFixed(2)}</strong></div>
            <p className="catalog-cart-note">La disponibilidad y el precio se confirman por Instagram. Esta consulta no reserva las prendas.</p>
            <button className="catalog-instagram-button" onClick={consultOnInstagram}><Send size={19}/>{copied ? "Lista copiada · abrir Instagram" : "Consultar por Instagram"}<ArrowUpRight size={17}/></button>
            <label className="catalog-message-label">Mensaje para copiar</label>
            <textarea className="catalog-message" value={messageText || inquiryMessage} readOnly onFocus={event => event.target.select()} rows={Math.min(7, cart.length + 3)}/>
            {copied && <p className="catalog-copied"><Check size={15}/> Copiamos la lista. Pégala en el chat de Instagram.</p>}
          </>}
        </section>
      </div>}
    </main>
  );
}
