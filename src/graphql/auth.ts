import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!, $rememberMe: Boolean) {
    login(username: $username, password: $password, rememberMe: $rememberMe) {
      __typename
      ... on CurrentUser {
        id
        identifier
      }
      ... on InvalidCredentialsError {
        message
      }
      ... on NotVerifiedError {
        message
      }
      ... on NativeAuthStrategyError {
        message
      }
    }
  }
`;

export const REGISTER_CUSTOMER_MUTATION = gql`
  mutation RegisterCustomerAccount($input: RegisterCustomerInput!) {
    registerCustomerAccount(input: $input) {
      __typename
      ... on Success {
        success
      }
      ... on MissingPasswordError {
        message
      }
      ... on PasswordValidationError {
        message
      }
      ... on NativeAuthStrategyError {
        message
      }
      ... on AlreadyRegisteredError {
        message
      }
    }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($emailAddress: String!) {
    requestPasswordReset(emailAddress: $emailAddress) {
      __typename
      ... on Success {
        success
      }
      ... on NativeAuthStrategyError {
        message
      }
      ... on NotVerifiedError {
        message
      }
    }
  }
`;
