import { useContext } from 'react';
import { WishlistContext } from '../context/wishlist-context';

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      wishlistIds: [],
      wishlistCount: 0,
      toggleWishlist: () => {},
      removeFromWishlist: () => {},
      isInWishlist: () => false,
    };
  }
  return context;
};
