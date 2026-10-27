export default function StatCard({ icon: Icon, label, value, meta, tone = 'accent', children }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__head">
        <span className="stat-card__icon">
          <Icon size={18} aria-hidden="true" />
        </span>
        <h3 className="stat-card__label">{label}</h3>
      </div>
      <p className="stat-card__value">{value}</p>
      {children}
      {meta && <p className="stat-card__meta">{meta}</p>}
    </article>
  );
}
