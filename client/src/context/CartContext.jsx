import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const CartContext = createContext();
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('jaziz_cart')) || []; } catch { return []; } });
  const [open, setOpen] = useState(false);
  useEffect(() => localStorage.setItem('jaziz_cart', JSON.stringify(items)), [items]);
  const add = (product, quantity = 1) => { setItems((current) => { const uniqueKey = `${product._id}-${product.size}`; const exists = current.find((x) => x.uniqueKey === uniqueKey); return exists ? current.map((x) => x.uniqueKey === uniqueKey ? { ...x, quantity: Math.min(10, x.quantity + quantity) } : x) : [...current, { ...product, uniqueKey, quantity }]; }); setOpen(true); };
  const update = (uniqueKey, quantity) => setItems((current) => quantity < 1 ? current.filter((x) => x.uniqueKey !== uniqueKey) : current.map((x) => x.uniqueKey === uniqueKey ? { ...x, quantity } : x));
  const remove = (uniqueKey) => setItems((current) => current.filter((x) => x.uniqueKey !== uniqueKey));
  const clear = () => setItems([]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [items]);
  return <CartContext.Provider value={{ items, open, setOpen, add, update, remove, clear, subtotal, count: items.reduce((s, x) => s + x.quantity, 0) }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
