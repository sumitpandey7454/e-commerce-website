import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        toast.success('Quantity updated');
        return prev.map(i =>
          i._id === product._id ? { ...i, qty: i.qty + quantity } : i
        );
      }
      toast.success(`${product.name} added to cart`);
      return [...prev, { ...product, qty: quantity }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i._id !== id));
    toast.error('Item removed from cart');
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const total     = items.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      total, itemCount, isOpen, setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};