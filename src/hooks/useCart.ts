import { useContext } from 'react';
import { CartContext } from '../context/cart-context';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      isCartOpen: false,
      setIsCartOpen: () => {},
      addItem: () => {},
      updateQuantity: () => {},
      removeItem: () => {},
      clearCart: () => {},
      lastAddedItem: null,
      clearLastAddedItem: () => {},
    };
  }
  return context;
};
