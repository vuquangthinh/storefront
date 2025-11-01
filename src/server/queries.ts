import { gql } from '@apollo/client';

// Keep operation names matching mock link in apollo.ts
export const GET_PRODUCTS = gql`
  query GET_PRODUCTS(
    $search: String
    $category: String
    $from: Int
    $to: Int
  ) {
    search(
      input: {
        term: $search
        collectionSlug: $category
        groupByProduct: true
        skip: $from
        take: $to
      }
    ) {
      items {
        slug
        productName
        productAsset { preview }
        priceWithTax { value }
      }
      totalItems
    }
  }
`;

export const GET_POST_SIDEBAR_DATA = gql`
  query GET_POST_SIDEBAR_DATA {
    postSidebarData {
      categories {
        name
        slug
        children { name slug }
      }
      recent { id slug title }
    }
  }
`;

export const GET_SHOP_SIDEBAR_DATA = gql`
  query GET_SHOP_SIDEBAR_DATA($demo: Int, $featured: Boolean) {
    shopSidebarData {
      categories {
        name
        slug
        children { name slug }
      }
      featured { name slug }
    }
  }
`;

// Vendure shop API: collections for categories in sidebar
export const V_COLLECTIONS = gql`
  query V_COLLECTIONS {
    collections(options: { filter: { parentId: { eq: "1" } } }) {
      items {
        id
        name
        slug
        parentId
        children {
          id
          name
          slug
        }
      }
    }
  }

`;
