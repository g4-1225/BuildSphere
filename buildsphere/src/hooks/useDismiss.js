import { useEffect } from 'react';

/**
 * Calls onDismiss when the user clicks outside `ref` or presses Escape.
 * Used by dropdowns, the notification panel and action menus.
 */
export default function useDismiss(ref, onDismiss, active = true) {
  useEffect(() => {
    if (!active) return undefined;

    function handlePointer(event) {
      if (ref.current && !ref.current.contains(event.target)) onDismiss();
    }
    function handleKey(event) {
      if (event.key === 'Escape') onDismiss();
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onDismiss, active]);
}
