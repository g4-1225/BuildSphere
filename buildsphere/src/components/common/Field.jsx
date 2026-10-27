import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Labelled form control with hint and error message.
 * `as` can be "input", "select" or "textarea".
 */
export function Field({ label, error, hint, as: Control = 'input', id, required, children, className = '', ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const describedBy = [error && `${fieldId}-error`, hint && `${fieldId}-hint`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label htmlFor={fieldId} className="field__label">
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </label>
      <Control
        id={fieldId}
        className="field__control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        {...props}
      >
        {children}
      </Control>
      {hint && <p id={`${fieldId}-hint`} className="field__hint">{hint}</p>}
      {error && (
        <p id={`${fieldId}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({ label = 'Password', error, hint, id, required, children, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const [visible, setVisible] = useState(false);
  const describedBy = [error && `${fieldId}-error`, hint && `${fieldId}-hint`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={fieldId} className="field__label">
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </label>
      <div className="field__with-action">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          className="field__control"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...props}
        />
        <button
          type="button"
          className="field__action"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      {children}
      {hint && <p id={`${fieldId}-hint`} className="field__hint">{hint}</p>}
      {error && (
        <p id={`${fieldId}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Styled checkbox with a label. */
export function Checkbox({ label, id, className = '', ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <label htmlFor={fieldId} className={`check ${className}`}>
      <input id={fieldId} type="checkbox" className="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
