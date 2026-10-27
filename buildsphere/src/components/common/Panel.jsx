import { useId } from 'react';

/** A titled content section used across the dashboard views. */
export default function Panel({ title, subtitle, actions, children, className = '', as: Tag = 'section' }) {
  const headingId = useId();
  return (
    <Tag className={`panel ${className}`} aria-labelledby={headingId}>
      <header className="panel__header">
        <div>
          <h2 id={headingId} className="panel__title">{title}</h2>
          {subtitle && <p className="panel__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="panel__actions">{actions}</div>}
      </header>
      {children}
    </Tag>
  );
}
