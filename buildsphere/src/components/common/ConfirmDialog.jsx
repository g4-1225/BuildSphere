import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * Confirmation dialog used for every "are you sure?" step.
 * - tone: "danger" (red confirm button) or "info" (primary button)
 * - onConfirm may be async; the dialog shows a loading state and only closes
 *   when it succeeds. If it throws, the error is shown and nothing closes.
 * - children: extra content under the message (warnings, typed confirmation…)
 */
export default function ConfirmDialog({
  title,
  message,
  children,
  confirmLabel = 'Delete',
  tone = 'danger',
  icon: Icon = TriangleAlert,
  size = 'sm',
  confirmDisabled = false,
  onConfirm,
  onClose,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err?.message || 'Something went wrong. Nothing was changed.');
      setBusy(false);
    }
  }

  // While an action is running, Escape and backdrop clicks are ignored.
  const safeClose = busy ? () => {} : onClose;

  return (
    <Modal
      title={title}
      onClose={safeClose}
      size={size}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy} data-autofocus>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} loading={busy} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm">
        <span className={`confirm__icon confirm__icon--${tone}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="confirm__content">
          {typeof message === 'string' ? <p className="confirm__message">{message}</p> : message}
          {children}
          {error && (
            <p className="form-alert confirm__error" role="alert">
              <TriangleAlert size={18} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
