import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPasswordManageMasterByEmailandTokenQueryVariables = Types.Exact<{
  email: Types.Scalars["String"]["input"];
  token?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetPasswordManageMasterByEmailandTokenQuery = {
  __typename?: "query_root";
  Tbl_PasswordManageMaster: Array<{
    __typename?: "Tbl_PasswordManageMaster";
    EmailId?: string | null;
    Password?: string | null;
    CreatedDate?: any | null;
    PasswordCreateDate?: any | null;
    EmailToken?: string | null;
  }>;
};

export const GetPasswordManageMasterByEmailandTokenDocument = gql`
  query GetPasswordManageMasterByEmailandToken(
    $email: String!
    $token: String
  ) {
    Tbl_PasswordManageMaster(
      where: { EmailId: { _eq: $email }, EmailToken: { _eq: $token } }
      order_by: { CreatedDate: desc }
    ) {
      EmailId
      Password
      CreatedDate
      PasswordCreateDate
      EmailToken
    }
  }
`;

/**
 * __useGetPasswordManageMasterByEmailandTokenQuery__
 *
 * To run a query within a React component, call `useGetPasswordManageMasterByEmailandTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPasswordManageMasterByEmailandTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPasswordManageMasterByEmailandTokenQuery({
 *   variables: {
 *      email: // value for 'email'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useGetPasswordManageMasterByEmailandTokenQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPasswordManageMasterByEmailandTokenQuery,
    GetPasswordManageMasterByEmailandTokenQueryVariables
  > &
    (
      | {
          variables: GetPasswordManageMasterByEmailandTokenQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPasswordManageMasterByEmailandTokenQuery,
    GetPasswordManageMasterByEmailandTokenQueryVariables
  >(GetPasswordManageMasterByEmailandTokenDocument, options);
}
export function useGetPasswordManageMasterByEmailandTokenLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPasswordManageMasterByEmailandTokenQuery,
    GetPasswordManageMasterByEmailandTokenQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPasswordManageMasterByEmailandTokenQuery,
    GetPasswordManageMasterByEmailandTokenQueryVariables
  >(GetPasswordManageMasterByEmailandTokenDocument, options);
}
// @ts-ignore
export function useGetPasswordManageMasterByEmailandTokenSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPasswordManageMasterByEmailandTokenQuery,
    GetPasswordManageMasterByEmailandTokenQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPasswordManageMasterByEmailandTokenQuery,
  GetPasswordManageMasterByEmailandTokenQueryVariables
>;
export function useGetPasswordManageMasterByEmailandTokenSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPasswordManageMasterByEmailandTokenQuery,
        GetPasswordManageMasterByEmailandTokenQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPasswordManageMasterByEmailandTokenQuery | undefined,
  GetPasswordManageMasterByEmailandTokenQueryVariables
>;
export function useGetPasswordManageMasterByEmailandTokenSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPasswordManageMasterByEmailandTokenQuery,
        GetPasswordManageMasterByEmailandTokenQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPasswordManageMasterByEmailandTokenQuery,
    GetPasswordManageMasterByEmailandTokenQueryVariables
  >(GetPasswordManageMasterByEmailandTokenDocument, options);
}
export type GetPasswordManageMasterByEmailandTokenQueryHookResult = ReturnType<
  typeof useGetPasswordManageMasterByEmailandTokenQuery
>;
export type GetPasswordManageMasterByEmailandTokenLazyQueryHookResult =
  ReturnType<typeof useGetPasswordManageMasterByEmailandTokenLazyQuery>;
export type GetPasswordManageMasterByEmailandTokenSuspenseQueryHookResult =
  ReturnType<typeof useGetPasswordManageMasterByEmailandTokenSuspenseQuery>;
export type GetPasswordManageMasterByEmailandTokenQueryResult =
  Apollo.QueryResult<
    GetPasswordManageMasterByEmailandTokenQuery,
    GetPasswordManageMasterByEmailandTokenQueryVariables
  >;
