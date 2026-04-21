import { useEffect, useRef } from 'react';

export const useImagePreload = (urls = []) => {
  const cache = useRef(new Set());

  useEffect(() => {
    const next = urls.filter((u) => u && !cache.current.has(u));
    if (!next.length) return;

    for (const url of next) {
      const img = new Image();
      img.src = url;
      img.onload = () => cache.current.add(url);
    }
  }, [urls.join(',')]);
};