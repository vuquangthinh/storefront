"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { toast } from "react-toastify";

import CartPopup from "~/components/features/product/common/cart-popup";

export type CartItem = {
  name: string;
  slug?: string;
  qty: number;
  price?: number;
  [key: string]: any;
};

export type CartContextType = {
  items: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (product: CartItem) => void;
  updateCart: (products: CartItem[]) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "riode-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {}
  }, [items]);

  const api = useMemo<CartContextType>(() => ({
    items,
    addToCart: (product: CartItem) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.name === product.name);
        if (idx > -1) {
          const next = [...prev];
          const curQty = parseInt(String(next[idx].qty));
          const addQty = parseInt(String(product.qty));
          next[idx] = { ...next[idx], qty: curQty + addQty };
          return next;
        }
        return [...prev, { ...product }];
      });
      toast.success(<CartPopup product={product} />, {
        className: "cart-toast",
        bodyClassName: "cart-toast-body",
        closeButton: false,
        icon: false,
      });
    },
    removeFromCart: (product: CartItem) => {
      setItems((prev) => prev.filter((p) => p.name !== product.name));
    },
    updateCart: (products: CartItem[]) => setItems(products),
  }), [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
