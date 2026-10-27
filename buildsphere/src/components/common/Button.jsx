import { Loader2 } from 'lucide-react';

/**
 * variant: primary | secondary | ghost | danger
 * size: md | sm | lg
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  type = 'button',
  className = '',
  children,
  disabled,
  ...props
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Loader2 size={16} className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
