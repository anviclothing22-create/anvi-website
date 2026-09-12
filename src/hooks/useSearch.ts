import { useContext } from 'react';
import { SearchContext, type SearchContextValue } from '../context/search-context';

export const useSearch = (): SearchContextValue => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
