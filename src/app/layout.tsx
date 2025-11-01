"use client";
import React, { ReactNode } from "react";
import { ApolloProvider } from "@/server/apollo";
import { client } from "@/server/apollo";
import { CartProvider } from "@/context/cart/CartContext";
import { WishlistProvider } from "@/context/wishlist/WishlistContext";
import "../../public/sass/style.scss";
import Layout from "@/components/layout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id="__next">
        <ApolloProvider client={client}>
          <WishlistProvider>
            <CartProvider>
              <Layout>{children}</Layout>
            </CartProvider>
          </WishlistProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
