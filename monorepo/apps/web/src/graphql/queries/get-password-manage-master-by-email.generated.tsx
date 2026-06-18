import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPasswordManageMasterByEmailQueryVariables = Types.Exact<{
  email: Types.Scalars["String"]["input"];
}>;

export type GetPasswordManageMasterByEmailQuery = {
  __typename?: "query_root";
  Tbl_PasswordManageMaster: Array<{
    __typename?: "Tbl_PasswordManageMaster";
    EmailId?: string | null;
    Password?: string | null;
    CreatedDate?: any | null;
    PasswordCreateDate?: any | null;
  }>;
};

export const GetPasswordManageMasterByEmailDocument = gql`
  query GetPasswordManageMasterByEmail($email: String!) {
    Tbl_PasswordManageMaster(
      where: { EmailId: { _eq: $email } }
      order_by: { CreatedDate: desc }
    ) {
      EmailId
      Password
      CreatedDate
      PasswordCreateDate
    }
  }
`;

/**
 * __useGetPasswordManageMasterByEmailQuery__
 *
 * To run a query within a React component, call `useGetPasswordManageMasterByEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPasswordManageMasterByEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPasswordManageMasterByEmailQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetPasswordManageMasterByEmailQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPasswordManageMasterByEmailQuery,
    GetPasswordManageMasterByEmailQueryVariables
  > &
    (
      | {
          variables: GetPasswordManageMasterByEmailQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPasswordManageMasterByEmailQuery,
    GetPasswordManageMasterByEmailQueryVariables
  >(GetPasswordManageMasterByEmailDocument, options);
}
export function useGetPasswordManageMasterByEmailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPasswordManageMasterByEmailQuery,
    GetPasswordManageMasterByEmailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPasswordManageMasterByEmailQuery,
    GetPasswordManageMasterByEmailQueryVariables
  >(GetPasswordManageMasterByEmailDocument, options);
}
// @ts-ignore
export function useGetPasswordManageMasterByEmailSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPasswordManageMasterByEmailQuery,
    GetPasswordManageMasterByEmailQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPasswordManageMasterByEmailQuery,
  GetPasswordManageMasterByEmailQueryVariables
>;
export function useGetPasswordManageMasterByEmailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPasswordManageMasterByEmailQuery,
        GetPasswordManageMasterByEmailQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPasswordManageMasterByEmailQuery | undefined,
  GetPasswordManageMasterByEmailQueryVariables
>;
export function useGetPasswordManageMasterByEmailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPasswordManageMasterByEmailQuery,
        GetPasswordManageMasterByEmailQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPasswordManageMasterByEmailQuery,
    GetPasswordManageMasterByEmailQueryVariables
  >(GetPasswordManageMasterByEmailDocument, options);
}
export type GetPasswordManageMasterByEmailQueryHookResult = ReturnType<
  typeof useGetPasswordManageMasterByEmailQuery
>;
export type GetPasswordManageMasterByEmailLazyQueryHookResult = ReturnType<
  typeof useGetPasswordManageMasterByEmailLazyQuery
>;
export type GetPasswordManageMasterByEmailSuspenseQueryHookResult = ReturnType<
  typeof useGetPasswordManageMasterByEmailSuspenseQuery
>;
export type GetPasswordManageMasterByEmailQueryResult = Apollo.QueryResult<
  GetPasswordManageMasterByEmailQuery,
  GetPasswordManageMasterByEmailQueryVariables
>;
