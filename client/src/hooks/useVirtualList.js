import { useState, useEffect, useRef, useCallback } from 'react';
import { rafThrottle } from '@/lib/perf.js';

export const useVirtualList = ({
  items      = [],
  itemHeight = 64,
  overscan   = 5,
  containerRef,
}) => {
  const [scrollTop,      setScrollTop]      = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    ro.observe(el);

    const onScroll = rafThrottle(() => setScrollTop(el.scrollTop));
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => { ro.disconnect(); el.removeEventListener('scroll', onScroll); };
  }, [containerRef]);

  const totalHeight  = items.length * itemHeight;
  const startIdx     = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIdx       = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIdx, endIdx).map((item, i) => ({
    item,
    index:  startIdx + i,
    offset: (startIdx + i) * itemHeight,
  }));

  return { visibleItems, totalHeight, startIdx, endIdx };
};