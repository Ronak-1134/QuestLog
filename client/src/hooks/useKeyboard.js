import { useEffect } from 'react';

export const useKeyboard = (bindings) => {
  useEffect(() => {
    const handler = (e) => {
      for (const [combo, fn] of Object.entries(bindings)) {
        const parts  = combo.toLowerCase().split('+');
        const key    = parts[parts.length - 1];
        const meta   = parts.includes('cmd')   || parts.includes('meta');
        const ctrl   = parts.includes('ctrl');
        const shift  = parts.includes('shift');
        const alt    = parts.includes('alt');

        const match =
          e.key.toLowerCase()  === key &&
          (meta  ? e.metaKey   : !e.metaKey)  &&
          (ctrl  ? e.ctrlKey   : !e.ctrlKey)  &&
          (shift ? e.shiftKey  : !e.shiftKey) &&
          (alt   ? e.altKey    : !e.altKey);

        if (match) { e.preventDefault(); fn(e); return; }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bindings]);
};