export default function ProgressBar({ value = 0, label = 'Progress', size = 'md', tone }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const autoTone = clamped === 100 ? 'success' : 'accent';
  return (
    <div
      className={`progress progress--${size} progress--${tone || autoTone}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="progress__fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
