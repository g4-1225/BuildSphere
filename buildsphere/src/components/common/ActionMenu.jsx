import { useCallback, useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import useDismiss from '../../hooks/useDismiss';

/**
 * Three-dot menu. items: [{ label, icon, onClick, danger }]
 * Keyboard: Enter/Space opens, ↑/↓ move, Escape closes.
 */
export default function ActionMenu({ label = 'More actions', items }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(wrapperRef, close, open);

  useEffect(() => {
    if (open) listRef.current?.querySelector('button')?.focus();
  }, [open]);

  function handleKeyDown(event) {
    const buttons = Array.from(listRef.current.querySelectorAll('button'));
    const index = buttons.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      buttons[(index + 1) % buttons.length].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length].focus();
    } else if (event.key === 'Escape') {
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div className="menu" ref={wrapperRef} onClick={(event) => event.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn icon-btn--sm"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      {open && (
        <div className="menu__list" role="menu" ref={listRef} onKeyDown={handleKeyDown}>
          {items.map(({ label: itemLabel, icon: Icon, onClick, danger }) => (
            <button
              key={itemLabel}
              type="button"
              role="menuitem"
              className={`menu__item ${danger ? 'menu__item--danger' : ''}`}
              onClick={() => {
                setOpen(false);
                onClick();
              }}
            >
              {Icon && <Icon size={16} aria-hidden="true" />}
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
