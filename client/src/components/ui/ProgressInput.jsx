import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils.js';

export const ProgressInput = ({ value = 0, onChange, className }) => {
  const [dragging, setDragging] = useState(false);
  const barRef = useRef(null);

  const compute = useCallback((e) => {
    const rect = barRef.current.getBoundingClientRect();
    const x    = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return Math.min(100, Math.max(0, Math.round((x / rect.width) * 100)));
  }, []);

  const start = (e) => { setDragging(true); onChange?.(compute(e)); };
  const move  = (e) => { if (dragging) onChange?.(compute(e)); };
  const end   = ()  => setDragging(false);

  return (
    <div
      ref={barRef}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
      className={cn(
        'relative h-1 rounded-full bg-[var(--color-border)]',
        'cursor-col-resize group select-none',
        className
      )}
    >
      {/* Fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-full
                   bg-foreground transition-[width] duration-100"
        style={{ width: `${value}%` }}
      />
      {/* Thumb */}
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
          'w-3 h-3 rounded-full bg-foreground',
          'border-2 border-background',
          'opacity-0 group-hover:opacity-100',
          dragging && 'opacity-100',
          'transition-opacity duration-150'
        )}
        style={{ left: `${value}%` }}
      />
    </div>
  );
};