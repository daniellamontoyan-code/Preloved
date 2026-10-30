export default function BrandLockup({ compact = false }) {
  return <span className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`}>
    <img src="/pitucas-logo.png" alt="Pitucas Pero Misias" />
    {!compact && <small>Moda para todos ✨ · Compra, vende, repeat.</small>}
  </span>;
}
