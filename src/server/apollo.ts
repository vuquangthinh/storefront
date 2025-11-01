'use client';
import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, gql, Observable } from '@apollo/client';
import * as AC from '@apollo/client/react';
import { ApolloProvider } from '@apollo/client/react';

// Detect environment and API endpoint
const API_URI = process.env.NEXT_PUBLIC_SHOP_API || 'http://localhost:3000/shop-api';
const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// A very lightweight mock link that returns empty data structures
// to keep UI functional without a real backend during migration.
const mockLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    const { operationName } = operation;

    // Default empty payloads matching current UI expectations
    const emptyProducts = { products: { data: [], total: 0 } };
    const emptyPostSidebar = { postSidebarData: { categories: [], recent: [] } };
    const emptyShopSidebar = { shopSidebarData: { categories: [], featured: [] } };

    let data: any = {};
    switch (operationName) {
      case 'GET_PRODUCTS':
        data = emptyProducts;
        break;
      case 'GET_POST_SIDEBAR_DATA':
        data = emptyPostSidebar;
        break;
      case 'GET_SHOP_SIDEBAR_DATA':
        data = emptyShopSidebar;
        break;
      default:
        data = {};
    }

    observer.next({ data });
    observer.complete();
  });
});

const link = isMock
  ? mockLink
  : new HttpLink({ uri: API_URI, credentials: 'same-origin' });

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export { ApolloProvider, gql };

export default function withApollo(_: { ssr?: boolean } = {}) {
  return function <P>(Wrapped: React.ComponentType<P>) {
    return function WithApollo(props: P) {
      return React.createElement(
        ApolloProvider as any,
        { client } as any,
        React.createElement(Wrapped as any, { ...(props as any) })
      );
    };
  };
}

function makeEmptyDataByDoc(doc: any) {
  const s = typeof doc === 'string' ? doc : (doc && (doc.loc?.source?.body as string)) || '';
  if (s.includes('GET_PRODUCTS')) return { products: { data: [], total: 0 } };
  if (s.includes('GET_POST_SIDEBAR_DATA')) return { postSidebarData: { categories: [], recent: [] } };
  if (s.includes('GET_SHOP_SIDEBAR_DATA')) return { shopSidebarData: { categories: [], featured: [] } };
  return {};
}

function normalizeDoc(doc: any) {
  return typeof doc === 'string' ? gql(doc as string) : doc;
}

// Lightweight mocked hooks to avoid relying on @apollo/client hooks
export function useLazyQuery<TData = any, TVars = any>(doc: any): [(opts?: { variables?: TVars }) => void, { data: any }] {
  if (isMock) {
    const [data, setData] = useState<any>(null);
    const exec = (_opts?: { variables?: TVars }) => setData(makeEmptyDataByDoc(doc));
    return [exec, { data }];
  }
  return (AC as any).useLazyQuery(normalizeDoc(doc)) as any;
}

export function useQuery<TData = any, TVars = any>(doc: any, opts?: { variables?: TVars }) {
  if (isMock) {
    const [data, setData] = useState<any>({});
    useEffect(() => {
      setData(makeEmptyDataByDoc(doc));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return { data, loading: false, error: undefined } as { data: any; loading: boolean; error: any };
  }
  return (AC as any).useQuery(normalizeDoc(doc), opts) as any;
}

// export function useMutation<TData = any, TVars = any>(doc: any, opts?: any) {
//   if (isMock) {
//     const exec = async (_opts?: { variables?: TVars }) => {
//       return { data: makeEmptyDataByDoc(doc) } as any;
//     };
//     const result = { data: undefined, loading: false, error: undefined } as any;
//     return [exec, result] as any;
//   }
//   return (AC as any).useMutation(normalizeDoc(doc), opts) as any;
// }
