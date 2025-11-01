"use client";

import { useQuery } from "@apollo/client/react";

import { ACTIVE_ORDER } from "@/graphql/cart";

type ActiveOrderResponse = {
  activeOrder: any;
};

export function useActiveOrder() {
  const { data, loading, error, refetch } = useQuery<ActiveOrderResponse>(ACTIVE_ORDER, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  return {
    order: data?.activeOrder ?? null,
    loading,
    error,
    refetch,
  };
}
