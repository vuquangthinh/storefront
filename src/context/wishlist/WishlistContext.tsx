"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type WishlistItem = {
  slug: string;
  name: string;
  [key: string]: any;
};

export type WishlistContextType = {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem | any) => void;
  isWishlisted: (slug: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const STORAGE_KEY = "riode-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed as WishlistItem[]);
        } else {
          // Reset to empty if stored data is malformed
          setItems([]);
        }
      }
    } catch {
      // Malformed data in storage; reset
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(items) ? items : []));
      }
    } catch {}
  }, [items]);

  const normalize = (item: any): WishlistItem | null => {
    const slug = item?.slug ?? item?.product?.slug ?? item?.data?.slug ?? null;
    const name = item?.name ?? item?.product?.name ?? item?.data?.name ?? slug ?? "";
    if (!slug) return null;
    return { slug, name, ...item } as WishlistItem;
  };

  const ctx = useMemo<WishlistContextType>(() => ({
    items,
    toggleWishlist: (item: WishlistItem | any) => {
      const normalized = normalize(item);
      if (!normalized) return; // ignore if cannot resolve slug
      setItems((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const found = list.find((p) => p.slug === normalized.slug);
        if (found) return list.filter((p) => p.slug !== normalized.slug);
        return [...list, normalized];
      });
    },
    isWishlisted: (slug: string) => Array.isArray(items) ? items.some((p) => p.slug === slug) : false,
  }), [items]);

  return <WishlistContext.Provider value={ctx}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
