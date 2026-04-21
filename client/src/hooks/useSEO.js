import { useEffect } from 'react';
import { setSEO, resetSEO } from '@/lib/seo.js';

export const useSEO = (meta, deps = []) => {
  useEffect(() => {
    if (meta) setSEO(meta);
    return resetSEO;
  }, deps);
};

export const useGameSEO = (game) => {
  const { setGameSEO } = require('@/lib/seo.js');
  useEffect(() => {
    if (game) setGameSEO(game);
    return resetSEO;
  }, [game?.igdbId]);
};