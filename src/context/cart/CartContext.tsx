"use client";
import React, { ReactNode, createContext, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client/react";

import CartPopup from "~/components/features/product/common/cart-popup";
import {
  ACTIVE_ORDER,
  ADD_ITEM_TO_ORDER,
  ADJUST_ORDER_LINE,
  REMOVE_ALL_ORDER_LINES,
  REMOVE_ORDER_LINE,
} from "@/graphql/cart";
import { useActiveOrder } from "@/hooks/use-active-order";

export type CartItem = {
  lineId: string;
  productVariantId: string;
  productSlug?: string;
  image?: string | null;
  name: string;
  qty: number;
  price: number;
  totalWithTax: number;
  variant?: any;
};

export type CartContextType = {
  order: any | null;
  items: CartItem[];
  isLoading: boolean;
  addToCart: (input: { productVariantId?: string; quantity?: number; product?: any }) => Promise<void>;
  adjustLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => Promise<any | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { order, refetch, loading } = useActiveOrder();

  console.log('order', order);
  
  const [addItemToOrder] = useMutation<{ addItemToOrder: any }, { productVariantId: string; quantity: number }>(
    ADD_ITEM_TO_ORDER,
    { refetchQueries: [{ query: ACTIVE_ORDER }], awaitRefetchQueries: true }
  );
  const [adjustOrderLine] = useMutation<{ adjustOrderLine: any }, { orderLineId: string; quantity: number }>(
    ADJUST_ORDER_LINE,
    { refetchQueries: [{ query: ACTIVE_ORDER }], awaitRefetchQueries: true }
  );
  const [removeOrderLine] = useMutation<{ removeOrderLine: any }, { orderLineId: string }>(
    REMOVE_ORDER_LINE,
    { refetchQueries: [{ query: ACTIVE_ORDER }], awaitRefetchQueries: true }
  );
  const [removeAllOrderLines] = useMutation<{ removeAllOrderLines: any }>(REMOVE_ALL_ORDER_LINES, {
    refetchQueries: [{ query: ACTIVE_ORDER }],
    awaitRefetchQueries: true,
  });

  const resolveAssetUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${url}`;
  };

  const items: CartItem[] = (order?.lines ?? []).map((line: any) => ({
    lineId: line.id,
    productVariantId: line.productVariant?.id,
    productSlug: line.productVariant?.product?.slug,
    image: resolveAssetUrl(line.productVariant?.featuredAsset?.preview ?? null),
    name: line.productVariant?.name ?? "",
    qty: Number(line.quantity) || 0,
    price: (line.productVariant?.priceWithTax ?? 0) / 100,
    totalWithTax: (line.discountedLinePriceWithTax ?? 0) / 100,
    variant: line.productVariant,
  }));

  const resolveVariantId = (input: { productVariantId?: string; product?: any }): string | undefined => {
    if (input.productVariantId) return input.productVariantId;
    const p = input.product;
    if (!p) return undefined;
    const candidates = [
      p.productVariantId,
      p.defaultVariantId,
      p.defaultVariant?.id,
      p.variantId,
      p.variant?.id,
      Array.isArray(p.variants) && p.variants[0]?.id,
      p.data?.productVariantId,
      p.data?.defaultVariantId,
      Array.isArray(p.data?.variants) && p.data?.variants[0]?.id,
      p.variant?.productVariantId,
    ];
    return candidates.find((id) => typeof id === "string" && id.length > 0);
  };

  const handleAddToCart = useCallback(
    async ({ productVariantId, quantity = 1, product }: { productVariantId?: string; quantity?: number; product?: any }) => {
      const resolvedVariantId = resolveVariantId({ productVariantId, product });
      if (!resolvedVariantId) {
        toast.error("Unable to add item to cart. Variant not available.");
        return;
      }
      const result = await addItemToOrder({ variables: { productVariantId: resolvedVariantId, quantity } });
      const payload = (result.data as { addItemToOrder?: any } | undefined)?.addItemToOrder;
      if (payload?.__typename === "ErrorResult" || payload?.__typename === "InsufficientStockError") {
        toast.error(payload?.message || "Unable to add item to cart.");
        return;
      }
      const latest = await refetch();
      const activeOrder = (latest?.data as { activeOrder?: any } | undefined)?.activeOrder;
      let toastProduct: any = {
        ...(product || {}),
        qty: quantity,
      };
      if (activeOrder && Array.isArray(activeOrder.lines)) {
        const line =
          activeOrder.lines.find((l: any) => l?.productVariant?.id === resolvedVariantId) ||
          activeOrder.lines[activeOrder.lines.length - 1];
        if (line) {
          toastProduct = {
            slug: line?.productVariant?.product?.slug || toastProduct?.slug,
            name: line?.productVariant?.name || toastProduct?.name,
            qty: Number(line?.quantity) || toastProduct?.qty || 1,
            price: (line?.productVariant?.priceWithTax ?? 0) / 100,
            image: resolveAssetUrl(line?.productVariant?.featuredAsset?.preview ?? null) || toastProduct?.image || null,
          };
        }
      }
      toast(<CartPopup product={toastProduct} />, {
        className: "cart-toast",
        bodyClassName: "cart-toast-body",
        closeButton: false,
        icon: false,
      });
    },
    [addItemToOrder, refetch]
  );

  const handleAdjustLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!lineId) return;
      const hasLine = order?.lines?.some((line: any) => line.id === lineId);
      if (!hasLine) {
        await refetch();
        toast.info('Your cart was refreshed because an item changed.');
        return;
      }
      if (quantity <= 0) {
        try {
          const { data } = await removeOrderLine({ variables: { orderLineId: lineId } });
          const payload = (data as { removeOrderLine?: any } | undefined)?.removeOrderLine;
          if (payload?.__typename === 'ErrorResult') {
            toast.error(payload?.message || 'Unable to remove item.');
          }
        } catch (error: any) {
          console.warn('Failed to remove order line', error);
          toast.error('Unable to remove item. Your cart was refreshed.');
        }
      } else {
        try {
          const { data } = await adjustOrderLine({ variables: { orderLineId: lineId, quantity } });
          const payload = (data as { adjustOrderLine?: any } | undefined)?.adjustOrderLine;
          if (payload?.__typename === 'ErrorResult') {
            toast.error(payload?.message || 'Unable to update quantity.');
          }
        } catch (error: any) {
          console.warn('Failed to adjust order line', error);
          toast.error('Unable to update quantity. Your cart was refreshed.');
        }
      }
      await refetch();
    },
    [adjustOrderLine, order?.lines, refetch, removeOrderLine]
  );

  const handleRemoveLine = useCallback(
    async (lineId: string) => {
      if (!lineId) return;
      const hasLine = order?.lines?.some((line: any) => line.id === lineId);
      if (!hasLine) {
        await refetch();
        toast.info('Your cart was refreshed because an item changed.');
        return;
      }
      try {
        const { data } = await removeOrderLine({ variables: { orderLineId: lineId } });
        const payload = (data as { removeOrderLine?: any } | undefined)?.removeOrderLine;
        if (payload?.__typename === 'ErrorResult') {
          toast.error(payload?.message || 'Unable to remove item.');
        }
      } catch (error: any) {
        console.warn('Failed to remove order line', error);
        toast.error('Unable to remove item. Your cart was refreshed.');
      }
      await refetch();
    },
    [order?.lines, refetch, removeOrderLine]
  );

  const handleClearCart = useCallback(async () => {
    await removeAllOrderLines();
    await refetch();
  }, [removeAllOrderLines, refetch]);

  const contextValue: CartContextType = {
    order: order ?? null,
    items,
    isLoading: loading,
    addToCart: handleAddToCart,
    adjustLine: handleAdjustLine,
    removeLine: handleRemoveLine,
    clearCart: handleClearCart,
    refetch: async () => {
      const result = await refetch();
      return (result?.data as { activeOrder?: any } | undefined)?.activeOrder ?? null;
    },
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
