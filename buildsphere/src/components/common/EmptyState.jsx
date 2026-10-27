export default function EmptyState({ icon: Icon, title, text, action, compact = false }) {
  return (
    <div className={`empty ${compact ? 'empty--compact' : ''}`}>
      {Icon && (
        <span className="empty__icon">
          <Icon size={compact ? 20 : 24} aria-hidden="true" />
        </span>
      )}
      <p className="empty__title">{title}</p>
      {text && <p className="empty__text">{text}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
