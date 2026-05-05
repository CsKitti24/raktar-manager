import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const existingItem = cart.find((item) => item.product_id === newItem.product_id);
    
    if (existingItem) {
      toast.success(`"${newItem.name}" mennyisége növelve a kosárban!`, {
        icon: '🛒',
      });
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product_id === newItem.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      toast.success(`"${newItem.name}" a kosárba került!`, {
        icon: '✅',
      });
      setCart((prevCart) => [...prevCart, { ...newItem, quantity }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
