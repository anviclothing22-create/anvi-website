import { createContext } from 'react';

export interface SearchContextValue {
  isSearchOpen: boolean;
  openSearch: (initialQuery?: string) => void;
  closeSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchContext = createContext<SearchContextValue | undefined>(undefined);
