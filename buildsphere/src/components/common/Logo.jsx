/** BuildSphere mark: four connected project blocks. */
export default function Logo({ size = 32, withText = false, className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="9" fill="#6C63FF" />
        <path d="M15 11.5h2M11.5 15v2M20.5 15v2M15 20.5h2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
        <rect x="7.5" y="7.5" width="7" height="7" rx="2" fill="#fff" />
        <rect x="17.5" y="7.5" width="7" height="7" rx="2" fill="#fff" opacity=".6" />
        <rect x="7.5" y="17.5" width="7" height="7" rx="2" fill="#fff" opacity=".6" />
        <rect x="17.5" y="17.5" width="7" height="7" rx="2" fill="#fff" />
      </svg>
      {withText && <span className="logo__text">BuildSphere</span>}
    </span>
  );
}
