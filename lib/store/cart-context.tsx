'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, ProductColor } from './products';

export interface CartItem {
  id: string; // Unique combination of productId + size + colorName
  productId: string;
  title: string;
  price: number;
  image: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: ProductColor;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color: ProductColor,
    quantity?: number,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
  promoDiscountPercent: number;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING_FEE = 12;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pulsewear_cart_v1');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedPromo = localStorage.getItem('pulsewear_promo_v1');
      if (savedPromo) {
        const parsed = JSON.parse(savedPromo);
        setPromoCode(parsed.code);
        setPromoDiscountPercent(parsed.percent);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('pulsewear_cart_v1', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color: ProductColor,
    quantity = 1,
  ) => {
    const itemId = `${product.id}-${size}-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          size,
          color,
          quantity,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('pulsewear_cart_v1');
  };

  const applyPromo = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'PULSE20' || clean === 'HOODIE20') {
      setPromoCode(clean);
      setPromoDiscountPercent(20);
      localStorage.setItem('pulsewear_promo_v1', JSON.stringify({ code: clean, percent: 20 }));
      return { success: true, message: 'Code PULSE20 applied! 20% discount unlocked.' };
    }
    if (clean === 'STUDENT15' || clean === 'WEBENG') {
      setPromoCode(clean);
      setPromoDiscountPercent(15);
      localStorage.setItem('pulsewear_promo_v1', JSON.stringify({ code: clean, percent: 15 }));
      return { success: true, message: 'Student pass applied! 15% discount unlocked.' };
    }
    return { success: false, message: 'Invalid promo code. Try "PULSE20" or "STUDENT15"' };
  };

  const removePromo = () => {
    setPromoCode(null);
    setPromoDiscountPercent(0);
    localStorage.removeItem('pulsewear_promo_v1');
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.round((subtotal * promoDiscountPercent) / 100);
  const shipping =
    subtotal > 0 && subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : subtotal > 0
        ? STANDARD_SHIPPING_FEE
        : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        shipping,
        total,
        promoCode,
        promoDiscountPercent,
        applyPromo,
        removePromo,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
