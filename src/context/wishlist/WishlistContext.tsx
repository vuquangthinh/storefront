"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type WishlistItem = {
  slug: string;
  name: string;
  [key: string]: any;
};

export type WishlistContextType = {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isWishlisted: (slug: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const STORAGE_KEY = "riode-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

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

  const ctx = useMemo<WishlistContextType>(() => ({
    items,
    toggleWishlist: (item: WishlistItem) => {
      setItems((prev) => {
        const found = prev.find((p) => p.slug === item.slug);
        if (found) return prev.filter((p) => p.slug !== item.slug);
        return [...prev, item];
      });
    },
    isWishlisted: (slug: string) => items.some((p) => p.slug === slug),
  }), [items]);

  return <WishlistContext.Provider value={ctx}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
