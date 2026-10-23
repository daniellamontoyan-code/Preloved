import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, Minus, Plus, Search, Send, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { getPublicCatalog } from "../lib/catalog";
import { signArticleImages } from "../lib/storage";
import "./CatalogoPublico.css";

const instagramUrl = "https://www.instagram.com/cherryclub.wav/";
const isDemoPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("demo") === "1";
const demoWelcomeBanner = isDemoPreview && new URLSearchParams(window.location.search).get("welcome") === "1";
function limaDateKey(date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
function isTuesdayInLima(date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", weekday: "short" }).format(date) === "Tue";
}
const previewArticles = [
  { id:"demo-1", descripcion:"Top tejido cereza", categoria:"Ropa", subcategoria:"Polos y tops", talla:"S", publico_objetivo:"Mujer", precio:35, codigo:"PR-0001", estado:"Disponible" },
  { id:"demo-2", descripcion:"Jean recto azul", categoria:"Ropa", subcategoria:"Pantalones", talla:"28", publico_objetivo:"Unisex", precio:55, codigo:"PR-0002", estado:"Disponible" },
  { id:"demo-3", descripcion:"Vestido floreado", categoria:"Ropa", subcategoria:"Vestidos", talla:"M", publico_objetivo:"Mujer", precio:48, codigo:"PR-0003", estado:"Disponible" },
  { id:"demo-4", descripcion:"Zapatillas urbanas", categoria:"Calzado", subcategoria:"Zapatillas", talla:"38", publico_objetivo:"Unisex", precio:70, codigo:"PR-0004", estado:"Disponible" },
  { id:"demo-5", descripcion:"Cartera vino", categoria:"Bolsos", subcategoria:"Carteras", talla:"Única", precio:42, codigo:"PR-0005", estado:"Disponible" },
  { id:"demo-6", descripcion:"Short de verano", categoria:"Ropa", subcategoria:"Shorts", talla:"S", precio:32, codigo:"PR-0006", estado:"Disponible" },
];

export default function CatalogoPublico() {
  const [articles, setArticles] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todo");
  const [subcategory, setSubcategory] = useState("Todas");
  const [size, setSize] = useState("Todas");
  const [audience, setAudience] = useState("Todos");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [dismissedDropKey, setDismissedDropKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [displayCount, setDisplayCount] = useState(24);

  useEffect(() => { loadCatalog(); }, []);

  useEffect(() => {
    if (!selectedArticle && !cartOpen && !termsOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = event => {
      if (event.key === "Escape") {
        setSelectedArticle(null);
        setCartOpen(false);
        setTermsOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedArticle, cartOpen, termsOpen]);

  async function loadCatalog() {
    setLoading(true);
    setLoadError(false);
    if (isDemoPreview) {
      setArticles(previewArticles);
      setLoading(false);
      return;
    }
    const result = await getPublicCatalog();
    setArticles(result.articles);
    setLoadError(Boolean(result.error));
    setLoading(false);
  }

  const categories = useMemo(() => [
    "Todo",
    ...new Set(articles.map(item => item.categoria).filter(Boolean)),
  ], [articles]);
  const categoryArticles = useMemo(() => articles
    .filter(item => category === "Todo" || item.categoria === category), [articles, category]);
  const subcategories = useMemo(() => [...new Set(categoryArticles
    .map(item => item.subcategoria)
    .filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")), [categoryArticles]);
  const audienceArticles = useMemo(() => categoryArticles
    .filter(item => subcategory === "Todas" || item.subcategoria === subcategory), [categoryArticles, subcategory]);
  const audiences = useMemo(() => [...new Set(audienceArticles.map(item => item.publico_objetivo).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es")), [audienceArticles]);
  const sizeSource = useMemo(() => audienceArticles
    .filter(item => audience === "Todos" || item.publico_objetivo === audience), [audienceArticles, audience]);
  const sizes = useMemo(() => [...new Set(sizeSource.map(item => item.talla).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "es", { numeric: true })), [sizeSource]);
  const activeFilterCount = Number(category !== "Todo") + Number(subcategory !== "Todas") + Number(size !== "Todas") + Number(audience !== "Todos") + Number(priceMin !== "" || priceMax !== "");
  const limaToday = limaDateKey(new Date());
  const tuesdayItems = articles.filter(item => {
    if (!item.created_at) return false;
    const createdAt = new Date(item.created_at);
    return !Number.isNaN(createdAt.getTime()) && limaDateKey(createdAt) === limaToday;
  });
  const latestDropTimestamp = tuesdayItems.reduce((latest, item) => Math.max(latest, new Date(item.created_at).getTime()), 0);
  const dropBannerKey = demoWelcomeBanner ? "cherryclub-demo-drop" : `cherryclub-drop-${limaToday}-${latestDropTimestamp}`;
  let dropDismissedInSession = false;
  try { dropDismissedInSession = window.sessionStorage.getItem(dropBannerKey) === "dismissed"; } catch { /* Storage may be unavailable in private browsing. */ }
  const showTuesdayBanner = (demoWelcomeBanner || (isTuesdayInLima(new Date()) && tuesdayItems.length > 0))
    && dropBannerKey !== dismissedDropKey && !dropDismissedInSession;

  function clearFilters() {
    setSearch("");
    setCategory("Todo");
    setSubcategory("Todas");
    setSize("Todas");
    setAudience("Todos");
    setPriceMin("");
    setPriceMax("");
  }

  function dismissTuesdayBanner() {
    try { window.sessionStorage.setItem(dropBannerKey, "dismissed"); } catch { /* Keep the banner dismissible if storage is unavailable. */ }
    setDismissedDropKey(dropBannerKey);
  }

  const visibleArticles = useMemo(() => articles.filter((item) => {
    const term = search.trim().toLocaleLowerCase("es");
    const matchesSearch = !term || [item.descripcion, item.codigo, item.categoria, item.subcategoria, item.talla, item.publico_objetivo]
      .filter(Boolean).some(value => String(value).toLocaleLowerCase("es").includes(term));
    const matchesCategory = category === "Todo" || item.categoria === category;
    const matchesSubcategory = subcategory === "Todas" || item.subcategoria === subcategory;
    const matchesSize = size === "Todas" || item.talla === size;
    const matchesAudience = audience === "Todos" || item.publico_objetivo === audience;
    const price = Number(item.precio || 0);
    const matchesMinPrice = priceMin === "" || price >= Number(priceMin);
    const matchesMaxPrice = priceMax === "" || price <= Number(priceMax);
    return matchesSearch && matchesCategory && matchesSubcategory && matchesSize && matchesAudience && matchesMinPrice && matchesMaxPrice;
  }), [articles, search, category, subcategory, size, audience, priceMin, priceMax]);
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
    ...cart.map(item => `• ${item.descripcion}${item.talla ? ` (talla ${item.talla})` : ""}${item.publico_objetivo ? ` · ${item.publico_objetivo}` : ""}${item.codigo ? ` · ${item.codigo}` : ""} — S/ ${Number(item.precio || 0).toFixed(2)}`),
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
      {isDemoPreview && <div className="catalog-preview-banner">Vista de prueba · productos ficticios, no son artículos reales</div>}
      {showTuesdayBanner && <aside className="catalog-tuesday-banner" aria-label="Nuevo drop de Cherry Club">
        <span className="catalog-tuesday-emoji" aria-hidden="true">🍒</span>
        <div><strong>¡Llegó el nuevo drop!</strong><p>{demoWelcomeBanner ? "Hoy hay prendas nuevas para descubrir." : `Subimos ${tuesdayItems.length} ${tuesdayItems.length === 1 ? "prenda nueva" : "prendas nuevas"} hoy. Encuentra tu favorita.`}</p></div>
        <a href="#catalog-products">Ver novedades <ArrowUpRight size={15}/></a>
        <button onClick={dismissTuesdayBanner} aria-label="Cerrar aviso del nuevo drop"><X size={17}/></button>
      </aside>}
      <header className="catalog-header">
        <a className="catalog-brand" href="/catalogo" aria-label="Cherry Club, inicio del catálogo">
          <img className="catalog-brand-logo" src="/cherry-club-logo.png" alt="Logo de Cherry Club: cerezas con un lazo" />
          <span>Cherry Club<small>MODA PARA TODOS</small></span>
        </a>
        <button className="catalog-cart-icon" onClick={() => setCartOpen(true)} aria-label={`Abrir carrito, ${cart.length} productos`}>
          <ShoppingBag size={21}/>
          {cart.length > 0 && <span>{cart.length}</span>}
        </button>
      </header>

      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <p className="catalog-eyebrow">CHERRY CLUB · MODA CIRCULAR</p>
          <h1>Moda para todos<span>✨</span></h1>
          <p>Compra, vende, repeat. Encuentra prendas únicas y dales una nueva historia.</p>
          <div className="catalog-hero-details">
            <span>🚚 Envíos a todo el Perú</span>
            <span>New drops · Martes 3 PM</span>
          </div>
          <a className="catalog-instagram-link" href={instagramUrl} target="_blank" rel="noreferrer">
            Síguenos en Instagram <ArrowUpRight size={16}/>
          </a>
        </div>
      </section>

      <section id="catalog-products" className="catalog-section" aria-label="Catálogo de prendas">
        <div className="catalog-section-heading">
          <div><p className="catalog-eyebrow">PIEZAS ÚNICAS, SEGUNDA VIDA</p><h2>Catálogo Cherry Club</h2></div>
        </div>

        <div className="catalog-layout">
          {mobileFiltersOpen && <button className="catalog-mobile-filter-backdrop" aria-label="Cerrar filtros" onClick={() => setMobileFiltersOpen(false)} />}
          <aside className={`catalog-sidebar${mobileFiltersOpen ? " open" : ""}`} aria-label="Filtros del catálogo">
            <div className="catalog-sidebar-heading"><h3>Filtrar por</h3><button className="catalog-mobile-filter-close" onClick={() => setMobileFiltersOpen(false)} aria-label="Cerrar filtros"><X size={19}/></button></div>
            {audiences.length > 0 && <section className="catalog-filter-group" aria-label="Filtrar por género">
              <h4>Género</h4>
              <div className="catalog-filter-options">
                {["Todos", ...audiences].map(value => <button key={value} className={audience === value ? "selected" : ""} onClick={() => { setAudience(value); setSize("Todas"); }}><span>{value}</span><span className="catalog-filter-check">{audience === value ? "✓" : ""}</span></button>)}
              </div>
            </section>}
            <section className="catalog-filter-group" aria-label="Filtrar por categoría">
              <h4>Categoría</h4>
              <div className="catalog-filter-options">
                {categories.map(value => <button key={value} className={category === value ? "selected" : ""} onClick={() => { setCategory(value); setSubcategory("Todas"); setAudience("Todos"); setSize("Todas"); }}><span>{value}</span><span className="catalog-filter-check">{category === value ? "✓" : ""}</span></button>)}
              </div>
            </section>
            {subcategories.length > 0 && <section className="catalog-filter-group" aria-label="Filtrar por subcategoría">
              <h4>Subcategoría</h4>
              <div className="catalog-filter-options">
                {["Todas", ...subcategories].map(value => <button key={value} className={subcategory === value ? "selected" : ""} onClick={() => { setSubcategory(value); setAudience("Todos"); setSize("Todas"); }}><span>{value}</span><span className="catalog-filter-check">{subcategory === value ? "✓" : ""}</span></button>)}
              </div>
            </section>}
            <section className="catalog-filter-group" aria-label="Filtrar por talla">
              <h4>Talla</h4>
              <div className="catalog-size-options">
                { ["Todas", ...sizes].map(value => <button key={value} className={size === value ? "selected" : ""} onClick={() => setSize(value)}>{value}</button>)}
              </div>
            </section>
            <section className="catalog-filter-group" aria-label="Filtrar por precio">
              <h4>Precio</h4>
              <div className="catalog-price-fields">
                <label><span>Mínimo</span><span className="catalog-price-input"><span>S/</span><input type="number" min="0" inputMode="decimal" placeholder="0" value={priceMin} onChange={event => setPriceMin(event.target.value)} aria-label="Precio mínimo"/></span></label>
                <span className="catalog-price-separator">a</span>
                <label><span>Máximo</span><span className="catalog-price-input"><span>S/</span><input type="number" min="0" inputMode="decimal" placeholder="∞" value={priceMax} onChange={event => setPriceMax(event.target.value)} aria-label="Precio máximo"/></span></label>
              </div>
            </section>
            <button className="catalog-clear-filters" onClick={clearFilters}>Limpiar filtros</button>
            <button className="catalog-mobile-filter-apply" onClick={() => setMobileFiltersOpen(false)}>Ver {visibleArticles.length} prendas</button>
          </aside>

          <div className="catalog-results">
            <div className="catalog-toolbar">
              <label className="catalog-search"><Search size={18}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Busca una prenda, talla o código"/></label>
              <button className="catalog-mobile-filter-toggle" onClick={() => setMobileFiltersOpen(true)}><SlidersHorizontal size={17}/> Filtrar{activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
              <span className="catalog-count">{loading ? "Cargando…" : `${visibleArticles.length} piezas`}</span>
            </div>

            {loading ? (
          <div className="catalog-empty"><div className="catalog-loader"/><p>Estamos preparando las prendas…</p></div>
        ) : loadError ? (
          <div className="catalog-empty"><span>🍒</span><h3>El catálogo se está preparando</h3><p>Vuelve a intentarlo en un momento.</p><button onClick={loadCatalog}>Reintentar</button></div>
        ) : visibleArticles.length === 0 ? (
          <div className="catalog-empty"><span>♡</span><h3>{articles.length ? "No encontramos prendas con esos filtros" : "Pronto habrá nuevas piezas"}</h3><p>{articles.length ? "Prueba con otra categoría, talla, precio o búsqueda." : "Estamos preparando el catálogo Cherry Club."}</p>{articles.length > 0 && <button onClick={clearFilters}>Ver todas las prendas</button>}</div>
        ) : (
          <div className="catalog-grid">
            {displayedArticles.map(article => {
              const inCart = cart.some(item => String(item.id) === String(article.id));
              return (
                <article className="catalog-product" key={article.id}>
                  <button className="catalog-product-open" type="button" onClick={() => setSelectedArticle(article)} aria-label={`Ver detalles de ${article.descripcion}`}>
                    <div className="catalog-product-photo">
                      {photoUrls[article.id] ? <img src={photoUrls[article.id]} alt={article.descripcion} loading="lazy"/> : <div className="catalog-photo-placeholder">🍒</div>}
                      {article.talla && <span className="catalog-size-tag">Talla {article.talla}</span>}
                    </div>
                    <div className="catalog-product-info">
                      <p className="catalog-product-category">{[article.categoria, article.subcategoria, article.publico_objetivo].filter(Boolean).join(" · ") || "Pieza única"}</p>
                      <h3>{article.descripcion}</h3>
                      {article.codigo && <span className="catalog-product-code">{article.codigo}</span>}
                    </div>
                  </button>
                  <div className="catalog-product-bottom"><strong>S/ {Number(article.precio || 0).toFixed(2)}</strong><button className={inCart ? "added" : ""} onClick={() => inCart ? removeFromCart(article.id) : addToCart(article)} aria-label={inCart ? `Quitar ${article.descripcion} del carrito` : `Agregar ${article.descripcion} al carrito`}>{inCart ? <Check size={17}/> : <Plus size={18}/>}</button></div>
                </article>
              );
            })}
            {displayedArticles.length < visibleArticles.length && <button className="catalog-load-more" onClick={() => setDisplayCount(count => count + 24)}>Ver más prendas</button>}
          </div>
        )}
          </div>
        </div>
      </section>

      <footer className="catalog-footer"><span>Cherry Club 🍒</span><span>Una segunda vida para piezas especiales</span><button className="catalog-terms-link" onClick={() => setTermsOpen(true)}>Términos y condiciones</button><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14}/></a></footer>

      {selectedArticle && <div className="catalog-detail-overlay" onClick={() => setSelectedArticle(null)}>
        <section className="catalog-detail-panel" role="dialog" aria-modal="true" aria-labelledby="catalog-detail-title" onClick={event => event.stopPropagation()}>
          <button className="catalog-close catalog-detail-close" onClick={() => setSelectedArticle(null)} aria-label="Cerrar detalles"><X size={21}/></button>
          <div className="catalog-detail-photo">
            {photoUrls[selectedArticle.id] ? <img src={photoUrls[selectedArticle.id]} alt={selectedArticle.descripcion}/> : <div className="catalog-photo-placeholder">🍒</div>}
            {selectedArticle.talla && <span className="catalog-size-tag">Talla {selectedArticle.talla}</span>}
          </div>
          <div className="catalog-detail-copy">
            <p className="catalog-product-category">{[selectedArticle.categoria, selectedArticle.subcategoria, selectedArticle.publico_objetivo].filter(Boolean).join(" · ") || "Pieza única"}</p>
            <h2 id="catalog-detail-title">{selectedArticle.descripcion}</h2>
            {selectedArticle.codigo && <p className="catalog-detail-code">Código {selectedArticle.codigo}</p>}
            {selectedArticle.talla && <p className="catalog-detail-size">Talla <strong>{selectedArticle.talla}</strong></p>}
            <strong className="catalog-detail-price">S/ {Number(selectedArticle.precio || 0).toFixed(2)}</strong>
            <button className="catalog-detail-add" onClick={() => { addToCart(selectedArticle); setSelectedArticle(null); }}><ShoppingBag size={18}/> Agregar al carrito</button>
            <p className="catalog-detail-note">Pieza única de segunda mano. La disponibilidad y el precio se confirman por Instagram.</p>
          </div>
        </section>
      </div>}

      {termsOpen && <div className="catalog-terms-overlay" onClick={() => setTermsOpen(false)}>
        <section className="catalog-terms-panel" role="dialog" aria-modal="true" aria-labelledby="catalog-terms-title" onClick={event => event.stopPropagation()}>
          <div className="catalog-terms-heading"><div><p className="catalog-eyebrow">CHERRY CLUB</p><h2 id="catalog-terms-title">Términos y condiciones</h2></div><button className="catalog-close" onClick={() => setTermsOpen(false)} aria-label="Cerrar términos y condiciones"><X size={21}/></button></div>
          <div className="catalog-terms-content">
            <p>Queremos que compres con información clara. Al consultar una prenda de Cherry Club, ten en cuenta lo siguiente:</p>
            <h3>Prendas y disponibilidad</h3>
            <p>Las prendas son piezas únicas de segunda mano. Revisa su descripción, talla y fotos; la disponibilidad y el precio final se confirman por Instagram antes de coordinar la compra.</p>
            <h3>Consultas, pedidos y envíos</h3>
            <p>Agregar una prenda al carrito solo prepara una consulta; no confirma ni reserva el producto. Realizamos envíos a todo el Perú. El costo del envío se cobra aparte del precio publicado y Cherry Club confirmará por Instagram su costo y plazo estimado antes de cerrar el pedido.</p>
            <h3>Cambios y devoluciones</h3>
            <p>Por tratarse de piezas únicas, no aceptamos cambios o devoluciones por arrepentimiento o por una talla elegida cuando el artículo coincide con la descripción publicada. Esto no limita los derechos que correspondan si la prenda presenta una falla no informada o no coincide con lo ofrecido. En ese caso, escríbenos para revisar una solución.</p>
            <h3>Contacto</h3>
            <p>Para consultas sobre una prenda o un pedido, escríbenos a <a href={instagramUrl} target="_blank" rel="noreferrer">@cherryclub.wav</a>.</p>
          </div>
          <button className="catalog-terms-done" onClick={() => setTermsOpen(false)}>Entendido</button>
        </section>
      </div>}

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
