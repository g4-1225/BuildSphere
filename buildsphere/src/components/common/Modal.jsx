import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Stack of open modals so Escape/Tab only affect the top-most one.
const openStack = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: traps focus, closes on Escape or backdrop click,
 * and returns focus to the element that opened it.
 */
export default function Modal({ title, description, onClose, children, footer, size = 'md' }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const token = {};
    openStack.push(token);
    const previouslyFocused = document.activeElement;
    const node = dialogRef.current;
    const getFocusable = () => Array.from(node.querySelectorAll(FOCUSABLE));

    const first = node.querySelector('[data-autofocus]') || getFocusable()[0] || node;
    first.focus();
    document.body.classList.add('no-scroll');

    function handleKey(event) {
      if (openStack[openStack.length - 1] !== token) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      openStack.splice(openStack.indexOf(token), 1);
      if (openStack.length === 0) document.body.classList.remove('no-scroll');
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
  }, []);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
      >
        <header className="modal__header">
          <div>
            <h2 id={titleId} className="modal__title">{title}</h2>
            {description && <p id={descId} className="modal__description">{description}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
