import { createContext } from 'react';

export interface WishlistContextType {
  wishlistIds: string[];
  wishlistCount: number;
  toggleWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
