import { gql } from "@apollo/client";

export const ACTIVE_ORDER = gql`
  query ACTIVE_ORDER {
    activeOrder {
      id
      code
      currencyCode
      subTotalWithTax
      totalWithTax
      shippingWithTax
      discounts {
        amountWithTax
        description
      }
      couponCodes
      shippingLines {
        id
        priceWithTax
        shippingMethod {
          id
          code
          name
        }
      }
      lines {
        id
        quantity
        discountedLinePriceWithTax
        productVariant {
          id
          name
          priceWithTax
          featuredAsset {
            preview
          }
          product {
            slug
          }
        }
      }
    }
  }
`;

export const ADD_ITEM_TO_ORDER = gql`
  mutation ADD_ITEM_TO_ORDER($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      __typename
      ... on Order {
        id
        code
        totalQuantity
      }
      ... on ErrorResult {
        errorCode
        message
      }
      ... on InsufficientStockError {
        quantityAvailable
        order {
          id
        }
      }
    }
  }
`;

export const ADJUST_ORDER_LINE = gql`
  mutation ADJUST_ORDER_LINE($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      __typename
      ... on Order {
        id
        code
        totalQuantity
      }
      ... on ErrorResult {
        errorCode
        message
      }
      ... on InsufficientStockError {
        quantityAvailable
        order {
          id
        }
      }
    }
  }
`;

export const REMOVE_ORDER_LINE = gql`
  mutation REMOVE_ORDER_LINE($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      __typename
      ... on Order {
        id
        code
        totalQuantity
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const REMOVE_ALL_ORDER_LINES = gql`
  mutation REMOVE_ALL_ORDER_LINES {
    removeAllOrderLines {
      __typename
      ... on Order {
        id
        code
        totalQuantity
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const APPLY_COUPON = gql`
  mutation APPLY_COUPON($couponCode: String!) {
    applyCouponCode(couponCode: $couponCode) {
      __typename
      ... on Order {
        id
        code
        couponCodes
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const REMOVE_COUPON = gql`
  mutation REMOVE_COUPON($couponCode: String!) {
    removeCouponCode(couponCode: $couponCode) {
      id
      code
      couponCodes
    }
  }
`;

export const ELIGIBLE_PAYMENT_METHODS = gql`
  query ELIGIBLE_PAYMENT_METHODS {
    eligiblePaymentMethods {
      id
      code
      name
      description
      eligibilityMessage
      isEligible
    }
  }
`;

export const ELIGIBLE_SHIPPING_METHODS = gql`
  query ELIGIBLE_SHIPPING_METHODS {
    eligibleShippingMethods {
      id
      code
      name
      description
      price
      priceWithTax
    }
  }
`;

export const SET_ORDER_SHIPPING_METHOD = gql`
  mutation SET_ORDER_SHIPPING_METHOD($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      __typename
      ... on Order {
        id
        code
        shippingWithTax
        totalWithTax
        shippingLines {
          id
          priceWithTax
          shippingMethod {
            id
            name
            code
          }
        }
        shippingAddress {
          fullName
          streetLine1
          streetLine2
          city
          postalCode
          countryCode
          phoneNumber
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const ADD_PAYMENT_TO_ORDER = gql`
  mutation ADD_PAYMENT_TO_ORDER($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      __typename
      ... on Order {
        id
        code
        payments {
          id
          method
          state
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
      ... on PaymentDeclinedError {
        paymentErrorMessage
      }
      ... on PaymentFailedError {
        paymentErrorMessage
      }
      ... on OrderStateTransitionError {
        errorCode
        message
        transitionError
      }
    }
  }
`;

export const ELIGIBLE_COUNTRIES = gql`
  query ELIGIBLE_COUNTRIES {
    availableCountries {
      id
      code
      name
    }
  }
`;

export const SET_ORDER_SHIPPING_ADDRESS = gql`
  mutation SET_ORDER_SHIPPING_ADDRESS($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      __typename
      ... on Order {
        id
        code
        shippingAddress {
          fullName
          streetLine1
          streetLine2
          city
          postalCode
          countryCode
          phoneNumber
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;
