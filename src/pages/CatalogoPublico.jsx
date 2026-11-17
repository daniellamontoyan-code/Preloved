import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Minus, Plus, Search, Send, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { getPublicCatalog } from "../lib/catalog";
import { signArticleImages } from "../lib/storage";
import "./CatalogoPublico.css";

const instagramUrl = "https://www.instagram.com/pitucasperomisias.pe/";
const publicCatalogCacheKey = "pitucas_public_catalog_v1";
const publicCatalogCacheMaxAge = 12 * 60 * 60 * 1000;
const newArticleBadgeMs = 7 * 24 * 60 * 60 * 1000;
const isDemoPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("demo") === "1";
const demoWelcomeBanner = isDemoPreview && new URLSearchParams(window.location.search).get("welcome") === "1";
function readCachedCatalog() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(publicCatalogCacheKey) || "null");
    if (!Number.isFinite(Number(cached?.savedAt)) || Date.now() - Number(cached.savedAt) > publicCatalogCacheMaxAge) return [];
    return Array.isArray(cached?.articles) ? cached.articles : [];
  } catch {
    return [];
  }
}
function wasRecentlyChanged(article) {
  const timestamps = [article.updated_at, article.created_at]
    .map(value => value ? new Date(value).getTime() : NaN)
    .filter(value => Number.isFinite(value) && value <= Date.now());
  if (!timestamps.length) return false;
  const latest = Math.max(...timestamps);
  return Date.now() - latest <= newArticleBadgeMs;
}
function limaDateKey(date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
function isThursdayInLima(date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", weekday: "short" }).format(date) === "Thu";
}
function normalizeFilterValue(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("es");
}
function uniqueFilterValues(items, field) {
  const values = new Map();
  for (const item of items) {
    const label = String(item[field] || "").trim();
    const key = normalizeFilterValue(label);
    if (key && !values.has(key)) values.set(key, label);
  }
  return [...values.values()].sort((a, b) => a.localeCompare(b, "es"));
}
function formatMeasures(value) {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return String(value);
    const fields = Object.entries(parsed.campos || {}).filter(([, amount]) => String(amount).trim())
      .map(([name, amount]) => `${name}: ${amount} cm`);
    if (parsed.notas?.trim()) fields.push(parsed.notas.trim());
    return fields.join(" · ") || String(value);
  } catch { return String(value); }
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
  const [articles, setArticles] = useState(readCachedCatalog);
  const [photoUrls, setPhotoUrls] = useState({});
  const [extraPhotoUrls, setExtraPhotoUrls] = useState({});
  const [loadedPhotos, setLoadedPhotos] = useState({});
  const [unavailablePhotos, setUnavailablePhotos] = useState({});
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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [productLinkCopied, setProductLinkCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [dismissedDropKey, setDismissedDropKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [displayCount, setDisplayCount] = useState(24);
  const photoRetryIdsRef = useRef(new Map());
  const productHistoryEntryRef = useRef(false);

  useEffect(() => { loadCatalog(); }, []);

  useEffect(() => {
    const syncProductFromUrl = () => {
      const sku = new URLSearchParams(window.location.search).get("sku");
      if (!sku) {
        productHistoryEntryRef.current = false;
        setSelectedArticle(null);
        return;
      }
      const match = articles.find(item => String(item.codigo || "").toLocaleLowerCase("es") === sku.toLocaleLowerCase("es"));
      if (match) {
        setSelectedPhotoIndex(0);
        setSelectedArticle(current => current?.id === match.id ? current : match);
      }
    };
    syncProductFromUrl();
    window.addEventListener("popstate", syncProductFromUrl);
    return () => window.removeEventListener("popstate", syncProductFromUrl);
  }, [articles]);

  useEffect(() => {
    if (!selectedArticle && !cartOpen && !termsOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = event => {
      if (event.key === "Escape") {
        closeArticle();
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
      setArticles(previewArticles.filter(item => item.foto));
      setPhotoUrls({});
      setExtraPhotoUrls({});
      setLoadedPhotos({});
      setUnavailablePhotos({});
      setLoading(false);
      return;
    }
    try {
      const result = await getPublicCatalog();
      if (result.error) throw result.error;
      const nextArticles = (result.articles || []).filter(item => typeof item.foto === "string" && item.foto.trim());
      setArticles(nextArticles);
      setPhotoUrls({});
      setExtraPhotoUrls({});
      setLoadedPhotos({});
      setUnavailablePhotos({});
      photoRetryIdsRef.current.clear();
      try {
        window.localStorage.setItem(publicCatalogCacheKey, JSON.stringify({ savedAt: Date.now(), articles: nextArticles }));
      } catch { /* The live catalog still works when browser storage is unavailable. */ }
    } catch (error) {
      console.error("No se pudo actualizar el catálogo público:", error);
      setLoadError(true);
      // Leave the last recently cached catalog in place so a temporary request failure
      // does not make the whole storefront look empty.
    } finally {
      setLoading(false);
    }
  }

  function openArticle(article) {
    setSelectedPhotoIndex(0);
    setSelectedArticle(article);
    setProductLinkCopied(false);
    if (!article.codigo) return;
    const url = new URL(window.location.href);
    url.searchParams.set("sku", article.codigo);
    window.history.pushState({ ...(window.history.state || {}), catalogProductSku: article.codigo }, "", url);
    productHistoryEntryRef.current = true;
  }

  function closeArticle() {
    setSelectedArticle(null);
    setProductLinkCopied(false);
    if (productHistoryEntryRef.current) {
      productHistoryEntryRef.current = false;
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    if (!url.searchParams.has("sku")) return;
    url.searchParams.delete("sku");
    window.history.replaceState(window.history.state, "", url);
  }

  async function copyProductLink(article) {
    if (!article?.codigo) return;
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("sku", article.codigo);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
      } else {
        const input = document.createElement("textarea");
        input.value = url.toString();
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand("copy");
        input.remove();
        if (!copied) throw new Error("El navegador no permitió copiar el enlace.");
      }
      setProductLinkCopied(true);
      window.setTimeout(() => setProductLinkCopied(false), 2200);
    } catch (error) {
      console.error("No se pudo copiar el enlace del producto:", error);
      alert("No se pudo copiar el enlace. Puedes copiarlo desde la barra del navegador.");
    }
  }

  const filterableArticles = useMemo(() => articles.filter(item => photoUrls[item.id] && !unavailablePhotos[item.id]), [articles, photoUrls, unavailablePhotos]);
  const categoryOptions = useMemo(() => uniqueFilterValues(filterableArticles, "categoria"), [filterableArticles]);
  const categories = ["Todo", ...categoryOptions];
  const categoryArticles = useMemo(() => filterableArticles
    .filter(item => category === "Todo" || normalizeFilterValue(item.categoria) === normalizeFilterValue(category)), [filterableArticles, category]);
  const subcategories = useMemo(() => uniqueFilterValues(categoryArticles, "subcategoria"), [categoryArticles]);
  const audienceArticles = useMemo(() => categoryArticles
    .filter(item => subcategory === "Todas" || normalizeFilterValue(item.subcategoria) === normalizeFilterValue(subcategory)), [categoryArticles, subcategory]);
  const audiences = useMemo(() => uniqueFilterValues(audienceArticles, "publico_objetivo"), [audienceArticles]);
  const sizeSource = useMemo(() => audienceArticles
    .filter(item => audience === "Todos" || normalizeFilterValue(item.publico_objetivo) === normalizeFilterValue(audience)), [audienceArticles, audience]);
  const sizes = useMemo(() => uniqueFilterValues(sizeSource, "talla")
    .sort((a, b) => String(a).localeCompare(String(b), "es", { numeric: true })), [sizeSource]);
  useEffect(() => {
    if (category !== "Todo" && !categoryOptions.some(value => normalizeFilterValue(value) === normalizeFilterValue(category))) {
      setCategory("Todo");
      setSubcategory("Todas");
      setAudience("Todos");
      setSize("Todas");
      return;
    }
    if (subcategory !== "Todas" && !subcategories.some(value => normalizeFilterValue(value) === normalizeFilterValue(subcategory))) {
      setSubcategory("Todas");
      setAudience("Todos");
      setSize("Todas");
      return;
    }
    if (audience !== "Todos" && !audiences.some(value => normalizeFilterValue(value) === normalizeFilterValue(audience))) setAudience("Todos");
    if (size !== "Todas" && !sizes.some(value => normalizeFilterValue(value) === normalizeFilterValue(size))) setSize("Todas");
  }, [category, categoryOptions, subcategory, subcategories, audience, audiences, size, sizes]);
  const activeFilterCount = Number(category !== "Todo") + Number(subcategory !== "Todas") + Number(size !== "Todas") + Number(audience !== "Todos") + Number(priceMin !== "" || priceMax !== "");
  const limaToday = limaDateKey(new Date());
  const dropItems = articles.filter(item => {
    if (!item.created_at) return false;
    const createdAt = new Date(item.created_at);
    return !Number.isNaN(createdAt.getTime()) && limaDateKey(createdAt) === limaToday;
  });
  const latestDropTimestamp = dropItems.reduce((latest, item) => Math.max(latest, new Date(item.created_at).getTime()), 0);
  const dropBannerKey = demoWelcomeBanner ? "pitucas-demo-drop" : `pitucas-drop-${limaToday}-${latestDropTimestamp}`;
  let dropDismissedInSession = false;
  try { dropDismissedInSession = window.sessionStorage.getItem(dropBannerKey) === "dismissed"; } catch { /* Storage may be unavailable in private browsing. */ }
  const showDropBanner = (demoWelcomeBanner || (isThursdayInLima(new Date()) && dropItems.length > 0))
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

  function dismissDropBanner() {
    try { window.sessionStorage.setItem(dropBannerKey, "dismissed"); } catch { /* Keep the banner dismissible if storage is unavailable. */ }
    setDismissedDropKey(dropBannerKey);
  }

  const visibleArticles = useMemo(() => articles.filter((item) => {
    if (!photoUrls[item.id] || unavailablePhotos[item.id]) return false;
    const term = search.trim().toLocaleLowerCase("es");
    const matchesSearch = !term || [item.descripcion, item.codigo, item.categoria, item.subcategoria, item.talla, item.publico_objetivo]
      .filter(Boolean).some(value => String(value).toLocaleLowerCase("es").includes(term));
    const matchesCategory = category === "Todo" || normalizeFilterValue(item.categoria) === normalizeFilterValue(category);
    const matchesSubcategory = subcategory === "Todas" || normalizeFilterValue(item.subcategoria) === normalizeFilterValue(subcategory);
    const matchesSize = size === "Todas" || normalizeFilterValue(item.talla) === normalizeFilterValue(size);
    const matchesAudience = audience === "Todos" || normalizeFilterValue(item.publico_objetivo) === normalizeFilterValue(audience);
    const price = Number(item.precio || 0);
    const matchesMinPrice = priceMin === "" || price >= Number(priceMin);
    const matchesMaxPrice = priceMax === "" || price <= Number(priceMax);
    return matchesSearch && matchesCategory && matchesSubcategory && matchesSize && matchesAudience && matchesMinPrice && matchesMaxPrice;
  }), [articles, search, category, subcategory, size, audience, priceMin, priceMax, photoUrls, unavailablePhotos]);
  const displayedArticles = useMemo(() => visibleArticles.slice(0, displayCount), [visibleArticles, displayCount]);
  const photosPending = articles.some(item => item.foto && !photoUrls[item.id] && !unavailablePhotos[item.id]);

  useEffect(() => {
    const photosToSign = articles.filter(item => item.foto);
    if (!photosToSign.length) return;
    let active = true;
    const signWithRetries = async () => {
      const batchSize = 64;
      for (let offset = 0; offset < photosToSign.length && active; offset += batchSize) {
        let pending = photosToSign.slice(offset, offset + batchSize);
        for (let attempt = 0; pending.length && attempt < 3; attempt += 1) {
          try {
            const signed = await signArticleImages(pending);
            if (!active) return;
            const urls = {};
            const extras = {};
            const unresolved = [];
            signed.forEach(item => {
              if (typeof item.foto === "string" && /^https?:\/\//i.test(item.foto)) urls[item.id] = item.foto;
              else unresolved.push(item);
              if (Array.isArray(item.fotos) && item.fotos.length) extras[item.id] = item.fotos;
            });
            if (Object.keys(urls).length) setPhotoUrls(current => ({ ...current, ...urls }));
            if (Object.keys(extras).length) setExtraPhotoUrls(current => ({ ...current, ...extras }));
            pending = unresolved;
          } catch (error) {
            console.error("No se pudieron firmar algunas fotos; se volverá a intentar:", error);
          }
          if (pending.length && attempt < 2) await new Promise(resolve => window.setTimeout(resolve, 700 * (attempt + 1)));
        }
        if (active && pending.length) {
          setUnavailablePhotos(current => ({ ...current, ...Object.fromEntries(pending.map(item => [item.id, true])) }));
        }
      }
    };
    signWithRetries();
    return () => { active = false; };
  }, [articles]);

  function markPhotoLoaded(articleId) {
    setLoadedPhotos(current => ({ ...current, [articleId]: true }));
  }

  async function retryPhotoBeforeHiding(articleId) {
    const retryStatus = photoRetryIdsRef.current.get(String(articleId));
    if (retryStatus === "refreshing") return;
    if (retryStatus === "retried") {
      setUnavailablePhotos(current => ({ ...current, [articleId]: true }));
      return;
    }
    photoRetryIdsRef.current.set(String(articleId), "refreshing");
    const article = articles.find(item => String(item.id) === String(articleId));
    if (!article) {
      photoRetryIdsRef.current.set(String(articleId), "retried");
      return;
    }
    try {
      const [signed] = await signArticleImages([article]);
      if (typeof signed?.foto === "string" && /^https?:\/\//i.test(signed.foto)) {
        photoRetryIdsRef.current.set(String(articleId), "retried");
        setLoadedPhotos(current => ({ ...current, [articleId]: false }));
        setPhotoUrls(current => ({ ...current, [articleId]: signed.foto }));
        if (Array.isArray(signed.fotos)) setExtraPhotoUrls(current => ({ ...current, [articleId]: signed.fotos }));
        return;
      }
    } catch (error) {
      console.error("No se pudo renovar el enlace de la foto:", error);
    }
    photoRetryIdsRef.current.set(String(articleId), "retried");
    setUnavailablePhotos(current => ({ ...current, [articleId]: true }));
  }

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
    "Hola, Pitucas Pero Misias 💕. Quisiera consultar disponibilidad de:",
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
      {showDropBanner && <aside className="catalog-tuesday-banner" aria-label="Nuevo drop de Pitucas Pero Misias">
        <span className="catalog-tuesday-emoji" aria-hidden="true">🍒</span>
        <div><strong>¡Llegó el nuevo drop!</strong><p>{demoWelcomeBanner ? "Hoy hay prendas nuevas para descubrir." : `Subimos ${dropItems.length} ${dropItems.length === 1 ? "prenda nueva" : "prendas nuevas"} hoy. Encuentra tu favorita.`}</p></div>
        <a href="#catalog-products">Ver novedades <ArrowUpRight size={15}/></a>
        <button onClick={dismissDropBanner} aria-label="Cerrar aviso del nuevo drop"><X size={17}/></button>
      </aside>}
      <header className="catalog-header">
        <a className="catalog-brand" href="/catalogo" aria-label="Pitucas Pero Misias, inicio del catálogo">
          <img className="catalog-brand-logo" src="/pitucas-imagotipo-horizontal.jpg" alt="Pitucas Pero Misias" />
        </a>
        <button className="catalog-cart-icon" onClick={() => setCartOpen(true)} aria-label={`Abrir carrito, ${cart.length} productos`}>
          <ShoppingBag size={21}/>
          {cart.length > 0 && <span>{cart.length}</span>}
        </button>
      </header>
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <p className="catalog-eyebrow">PITUCAS PERO MISIAS · MODA CIRCULAR</p>
          <h1>
            <span className="catalog-hero-title-line">VEN POR LA ROPA.</span>
            <span className="catalog-hero-title-line">QUÉDATE POR EL CHISME.</span>
          </h1>
          <p>Compra, vende y descubre tu estilo.</p>
          <p className="catalog-hero-manifesto">Un espacio para expresarte, probar cosas nuevas y ser tú mismo, sin pedir permiso.</p>
          <div className="catalog-hero-details">
            <span>🚚 Envíos a todo el Perú</span>
            <span>New drops · Jueves 3 PM</span>
          </div>
          <a className="catalog-instagram-link" href={instagramUrl} target="_blank" rel="noreferrer">
            Síguenos en Instagram <ArrowUpRight size={16}/>
          </a>
        </div>
        <img className="catalog-hero-mascot" src="/pitucas-dani-mafer-circular.png" alt="Dani, Mafer y sus gatos dentro del isotipo circular de Pitucas Pero Misias" />
      </section>

      <section id="catalog-products" className="catalog-section" aria-label="Catálogo de prendas">
        <div className="catalog-section-heading">
          <div><p className="catalog-eyebrow">PIEZAS ÚNICAS, SEGUNDA VIDA</p><h2>Catálogo Pitucas Pero Misias</h2></div>
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
            {categoryOptions.length > 0 && <section className="catalog-filter-group" aria-label="Filtrar por categoría">
              <h4>Categoría</h4>
              <div className="catalog-filter-options">
                {categories.map(value => <button key={value} className={category === value ? "selected" : ""} onClick={() => { setCategory(value); setSubcategory("Todas"); setAudience("Todos"); setSize("Todas"); }}><span>{value}</span><span className="catalog-filter-check">{category === value ? "✓" : ""}</span></button>)}
              </div>
            </section>}
            {subcategories.length > 0 && <section className="catalog-filter-group" aria-label="Filtrar por subcategoría">
              <h4>Subcategoría</h4>
              <div className="catalog-filter-options">
                {["Todas", ...subcategories].map(value => <button key={value} className={subcategory === value ? "selected" : ""} onClick={() => { setSubcategory(value); setAudience("Todos"); setSize("Todas"); }}><span>{value}</span><span className="catalog-filter-check">{subcategory === value ? "✓" : ""}</span></button>)}
              </div>
            </section>}
            {sizes.length > 0 && <section className="catalog-filter-group" aria-label="Filtrar por talla">
              <h4>Talla</h4>
              <div className="catalog-size-options">
                { ["Todas", ...sizes].map(value => <button key={value} className={size === value ? "selected" : ""} onClick={() => setSize(value)}>{value}</button>)}
              </div>
            </section>}
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

            {visibleArticles.length === 0 && (loading || photosPending) ? (
          <div className="catalog-empty"><div className="catalog-loader"/><p>Estamos preparando las prendas…</p></div>
        ) : loadError && articles.length === 0 ? (
          <div className="catalog-empty"><span>🍒</span><h3>El catálogo se está preparando</h3><p>Vuelve a intentarlo en un momento.</p><button onClick={loadCatalog}>Reintentar</button></div>
        ) : visibleArticles.length === 0 ? (
          <div className="catalog-empty"><span>♡</span><h3>{articles.length && Object.keys(photoUrls).some(id => !unavailablePhotos[id]) ? "No encontramos prendas con esos filtros" : "Pronto habrá nuevas piezas"}</h3><p>{articles.length && Object.keys(photoUrls).some(id => !unavailablePhotos[id]) ? "Prueba con otra categoría, talla, precio o búsqueda." : "Mostramos solo prendas con una foto cargada correctamente."}</p>{articles.length > 0 && Object.keys(photoUrls).some(id => !unavailablePhotos[id]) && <button onClick={clearFilters}>Ver todas las prendas</button>}</div>
        ) : (
          <div className="catalog-grid">
            {displayedArticles.map((article, index) => {
              const inCart = cart.some(item => String(item.id) === String(article.id));
              return (
                <article className={`catalog-product${loadedPhotos[article.id] ? " photo-ready" : " photo-pending"}`} key={article.id}>
                  <button className="catalog-product-open" type="button" onClick={() => openArticle(article)} aria-label={`Ver detalles de ${article.descripcion}`}>
                    <div className="catalog-product-photo">
                      {photoUrls[article.id] && <img src={photoUrls[article.id]} alt={article.descripcion} loading={index < 4 ? "eager" : "lazy"} fetchPriority={index < 4 ? "high" : "auto"} decoding="async" onLoad={() => markPhotoLoaded(article.id)} onError={() => retryPhotoBeforeHiding(article.id)}/>}
                      {wasRecentlyChanged(article) && <span className="catalog-new-tag">¡Nuevo!</span>}
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

      <footer className="catalog-footer"><span>Pitucas Pero Misias 💕</span><span>Moda para todos · Compra, vende, repeat.</span><button className="catalog-terms-link" onClick={() => setTermsOpen(true)}>Términos y condiciones</button><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14}/></a></footer>

      {selectedArticle && <div className="catalog-detail-overlay" onClick={closeArticle}>
        <section className="catalog-detail-panel" role="dialog" aria-modal="true" aria-labelledby="catalog-detail-title" onClick={event => event.stopPropagation()}>
          <button className="catalog-close catalog-detail-close" onClick={closeArticle} aria-label="Cerrar detalles"><X size={21}/></button>
          <div className="catalog-detail-photo">
            {(() => {
              const id = selectedArticle.id;
              const gallery = [
                ...(photoUrls[id] && !unavailablePhotos[id] ? [photoUrls[id]] : []),
                ...(extraPhotoUrls[id] || []),
              ];
              const currentIndex = Math.min(selectedPhotoIndex, Math.max(0, gallery.length - 1));
              return gallery.length
                ? <>
                  <img src={gallery[currentIndex]} alt={`${selectedArticle.descripcion} · foto ${currentIndex + 1} de ${gallery.length}`} onLoad={() => markPhotoLoaded(id)} onError={() => { const failingUrl = gallery[currentIndex]; if (failingUrl === photoUrls[id]) retryPhotoBeforeHiding(id); else setExtraPhotoUrls(current => ({ ...current, [id]: (current[id] || []).filter(url => url !== failingUrl) })); }}/>
                  {gallery.length > 1 && <>
                    <button type="button" className="catalog-gallery-arrow previous" aria-label="Foto anterior" onClick={() => setSelectedPhotoIndex(index => (index - 1 + gallery.length) % gallery.length)}><ChevronLeft size={24}/></button>
                    <button type="button" className="catalog-gallery-arrow next" aria-label="Foto siguiente" onClick={() => setSelectedPhotoIndex(index => (index + 1) % gallery.length)}><ChevronRight size={24}/></button>
                    <span className="catalog-gallery-count">{currentIndex + 1} / {gallery.length}</span>
                  </>}
                </>
                : <div className="catalog-photo-placeholder" role="img" aria-label="La foto no está disponible"><span>🍒</span><small>La foto no cargó; aquí puedes ver los detalles</small></div>;
            })()}
            {selectedArticle.talla && <span className="catalog-size-tag">Talla {selectedArticle.talla}</span>}
          </div>
          <div className="catalog-detail-copy">
            <p className="catalog-product-category">{[selectedArticle.categoria, selectedArticle.subcategoria, selectedArticle.publico_objetivo].filter(Boolean).join(" · ") || "Pieza única"}</p>
            <h2 id="catalog-detail-title">{selectedArticle.descripcion}</h2>
            {selectedArticle.codigo && <p className="catalog-detail-code">Código {selectedArticle.codigo}</p>}
            {selectedArticle.talla && <p className="catalog-detail-size">Talla <strong>{selectedArticle.talla}</strong></p>}
            {selectedArticle.medidas && <p className="catalog-detail-size">Medidas <strong>{formatMeasures(selectedArticle.medidas)}</strong></p>}
            {selectedArticle.codigo && <button type="button" className="catalog-detail-share" onClick={() => copyProductLink(selectedArticle)}><Copy size={17}/>{productLinkCopied ? "Enlace copiado" : "Copiar enlace de esta prenda"}</button>}
            <strong className="catalog-detail-price">S/ {Number(selectedArticle.precio || 0).toFixed(2)}</strong>
            <button className="catalog-detail-add" onClick={() => { addToCart(selectedArticle); closeArticle(); }}><ShoppingBag size={18}/> Agregar al carrito</button>
            <p className="catalog-detail-note">Pieza única de segunda mano. La disponibilidad y el precio se confirman por Instagram.</p>
          </div>
        </section>
      </div>}

      {termsOpen && <div className="catalog-terms-overlay" onClick={() => setTermsOpen(false)}>
        <section className="catalog-terms-panel" role="dialog" aria-modal="true" aria-labelledby="catalog-terms-title" onClick={event => event.stopPropagation()}>
          <div className="catalog-terms-heading"><div><p className="catalog-eyebrow">PITUCAS PERO MISIAS</p><h2 id="catalog-terms-title">Términos y condiciones</h2></div><button className="catalog-close" onClick={() => setTermsOpen(false)} aria-label="Cerrar términos y condiciones"><X size={21}/></button></div>
          <div className="catalog-terms-content">
            <p>Queremos que compres con información clara. Al consultar una prenda de Pitucas Pero Misias, ten en cuenta lo siguiente:</p>
            <h3>Prendas y disponibilidad</h3>
            <p>Las prendas son piezas únicas de segunda mano. Revisa su descripción, talla y fotos; la disponibilidad y el precio final se confirman por Instagram antes de coordinar la compra.</p>
            <h3>Consultas, pedidos y envíos</h3>
            <p>Agregar una prenda al carrito solo prepara una consulta; no confirma ni reserva el producto. Realizamos envíos a todo el Perú. El costo del envío se cobra aparte del precio publicado y Pitucas Pero Misias confirmará por Instagram su costo y plazo estimado antes de cerrar el pedido.</p>
            <h3>Cambios y devoluciones</h3>
            <p>Por tratarse de piezas únicas, no aceptamos cambios o devoluciones por arrepentimiento o por una talla elegida cuando el artículo coincide con la descripción publicada. Esto no limita los derechos que correspondan si la prenda presenta una falla no informada o no coincide con lo ofrecido. En ese caso, escríbenos para revisar una solución.</p>
            <h3>Contacto</h3>
            <p>Para consultas sobre una prenda o un pedido, escríbenos a <a href={instagramUrl} target="_blank" rel="noreferrer">@pitucasperomisias.pe</a>.</p>
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
