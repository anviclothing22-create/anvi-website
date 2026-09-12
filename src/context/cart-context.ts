import { createContext } from 'react';

export interface CartItem {
  id: string;
  /** Supabase product UUID for server checkout; absent on legacy guest items. */
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
  slug?: string;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number; openDrawer?: boolean }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  lastAddedItem: CartItem | null;
  clearLastAddedItem: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
