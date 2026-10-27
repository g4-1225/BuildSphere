export default function PageHeader({ title, text, action }) {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-header__title">{title}</h2>
        {text && <p className="page-header__text">{text}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  );
}
