import { useState }   from 'react';
import { useQuery }   from '@tanstack/react-query';
import { useDebounce } from './useDebounce.js';
import api             from '@/lib/axios.js';

export const useGameSearch = (limit = 12) => {
  const [query, setQuery] = useState('');
  const debounced         = useDebounce(query, 320);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['gameSearch', debounced, limit],
    queryFn:  async () => {
      const { data } = await api.get('/games/search', {
        params: { q: debounced, limit },
      });
      return data.data ?? [];
    },
    enabled:          debounced.trim().length >= 2,
    staleTime:        1000 * 60 * 5,
    keepPreviousData: true,
  });

  const clear = () => setQuery('');

  return {
    query,
    setQuery,
    clear,
    results:    data ?? [],
    isLoading:  isLoading && debounced.length >= 2,
    isFetching: isFetching && debounced.length >= 2,
    hasQuery:   debounced.trim().length >= 2,
  };
};